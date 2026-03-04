import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import started from 'electron-squirrel-startup';
import { updateElectronApp } from 'update-electron-app';

if (started) app.quit();

if (app.isPackaged) updateElectronApp();

Menu.setApplicationMenu(null);

const execAsync = promisify(exec);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 780,
    height: 580,
    resizable: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ── Jellyfin auto-setup ───────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function jellyfinGet(path: string, port: number): Promise<number> {
  return new Promise(resolve => {
    http.get({ hostname: 'localhost', port, path }, res => {
      res.resume();
      resolve(res.statusCode ?? 0);
    }).on('error', () => resolve(0));
  });
}

function jellyfinPost(path: string, port: number, body: object): Promise<number> {
  return new Promise(resolve => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost', port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => { res.resume(); resolve(res.statusCode ?? 0); });
    req.on('error', () => resolve(0));
    req.write(data);
    req.end();
  });
}

async function configureJellyfin(port: number, adminPassword: string): Promise<void> {
  // Wait up to 2 minutes for Jellyfin to be ready
  for (let i = 0; i < 24; i++) {
    const status = await jellyfinGet('/health', port);
    if (status === 200) break;
    await sleep(5000);
  }
  // Skip if wizard already completed (returns 4xx)
  const check = await jellyfinGet('/Startup/Configuration', port);
  if (check !== 200) return;

  await jellyfinPost('/Startup/User', port, { Name: 'admin', Password: adminPassword, PasswordConf: adminPassword });
  await jellyfinPost('/Startup/Complete', port, {});
}

// ── Helpers ───────────────────────────────────────────────────

function dockerEnv() {
  const base = process.env.PATH ?? '';
  if (process.platform === 'darwin') {
    const extra = '/usr/local/bin:/opt/homebrew/bin:/usr/bin';
    return { ...process.env, PATH: `${base}:${extra}` };
  }
  const extra = [
    'C:\\Program Files\\Docker\\Docker\\resources\\bin',
    'C:\\Program Files (x86)\\Docker\\Docker\\resources\\bin',
  ].join(';');
  return { ...process.env, PATH: `${base};${extra}` };
}

function composeDir() {
  return path.join(app.getPath('userData'), 'stack');
}

function parseEnv(content: string): Record<string, string> {
  return Object.fromEntries(
    content.split('\n')
      .filter(l => l.includes('=') && !l.startsWith('#'))
      .map(l => {
        const idx = l.indexOf('=');
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
      })
  );
}

// ── IPC Handlers ─────────────────────────────────────────────

ipcMain.handle('get-version', () => app.getVersion());

ipcMain.handle('check-docker', async () => {
  try { await execAsync('docker info', { env: dockerEnv() }); return true; }
  catch { return false; }
});

ipcMain.handle('pick-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('open-external', (_e, url: string) => {
  shell.openExternal(url);
});

// Returns parsed .env config, or null if not installed
ipcMain.handle('get-config', async () => {
  try {
    const content = await fs.readFile(path.join(composeDir(), '.env'), 'utf8');
    const cfg = parseEnv(content);
    return { ...cfg, vpnEnabled: !!cfg.MULLVAD_PRIVATE_KEY };
  } catch {
    return null;
  }
});

// Returns 'running' | 'stopped'
ipcMain.handle('get-status', async () => {
  try {
    const { stdout } = await execAsync('docker compose ps -q', { cwd: composeDir(), env: dockerEnv() });
    return stdout.trim().split('\n').filter(Boolean).length > 0 ? 'running' : 'stopped';
  } catch {
    return 'stopped';
  }
});

ipcMain.handle('start-stack', async () => {
  await execAsync('docker compose up -d', { cwd: composeDir(), env: dockerEnv() });
});

ipcMain.handle('stop-stack', async () => {
  await execAsync('docker compose down', { cwd: composeDir(), env: dockerEnv() });
});

// Returns machine's local IPv4 address
ipcMain.handle('get-local-ip', () => {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
});

// Reset installation — stops stack and deletes compose dir so wizard runs again
ipcMain.handle('reset-install', async () => {
  const dir = composeDir();
  try { await execAsync('docker compose down', { cwd: dir, env: dockerEnv() }); } catch {}
  await fs.rm(dir, { recursive: true, force: true });
});

ipcMain.handle('install', async (_e, config: {
  dataPath: string; adminPassword: string;
  vpnEnabled: boolean; mullvadKey: string; mullvadAddress: string;
}) => {
  const { dataPath, adminPassword, vpnEnabled, mullvadKey, mullvadAddress } = config;

  const dirs = [
    'jellyfin/config', 'jellyfin/cache',
    'jellyfin/media/movies', 'jellyfin/media/series', 'jellyfin/media/music',
    'downloads', 'prowlarr/config', 'radarr/config', 'sonarr/config',
    'lidarr/config', 'bazarr/config', 'qbittorrent/config', 'jellyseerr/config',
  ];
  for (const dir of dirs) await fs.mkdir(path.join(dataPath, dir), { recursive: true });

  const dir = composeDir();
  await fs.mkdir(dir, { recursive: true });

  const envContent = [
    `DATA_PATH=${dataPath.replace(/\\/g, '/')}`,
    `TZ=Europe/Madrid`,
    `JELLYFIN_PORT=8096`, `JELLYSEERR_PORT=5055`, `PROWLARR_PORT=9696`,
    `RADARR_PORT=7878`, `SONARR_PORT=8989`, `LIDARR_PORT=8686`,
    `BAZARR_PORT=6767`, `QBIT_PORT=8090`,
    `JELLYFIN_ADMIN_PASSWORD=${adminPassword}`,
    vpnEnabled ? `MULLVAD_PRIVATE_KEY=${mullvadKey}` : '',
    vpnEnabled ? `MULLVAD_ADDRESSES=${mullvadAddress}` : '',
  ].filter(Boolean).join('\n');

  await fs.writeFile(path.join(dir, '.env'), envContent);

  const composeFile = vpnEnabled ? 'docker-compose.yml' : 'docker-compose-novpn.yml';
  const src = app.isPackaged
    ? path.join(process.resourcesPath, 'stack', composeFile)
    : path.join(__dirname, `../../stack/${composeFile}`);
  await fs.copyFile(src, path.join(dir, 'docker-compose.yml'));

  await execAsync('docker compose up -d', { cwd: dir, env: dockerEnv() });
  try { await configureJellyfin(8096, adminPassword); } catch { /* ignore */ }
});

ipcMain.handle('add-vpn', async (_e, { mullvadKey, mullvadAddress }: { mullvadKey: string; mullvadAddress: string }) => {
  const dir = composeDir();
  let env = await fs.readFile(path.join(dir, '.env'), 'utf8');
  env = env.replace(/^MULLVAD_PRIVATE_KEY=.*$/m, '').replace(/^MULLVAD_ADDRESSES=.*$/m, '').trim();
  env += `\nMULLVAD_PRIVATE_KEY=${mullvadKey}\nMULLVAD_ADDRESSES=${mullvadAddress}\n`;
  await fs.writeFile(path.join(dir, '.env'), env);

  const src = app.isPackaged
    ? path.join(process.resourcesPath, 'stack', 'docker-compose.yml')
    : path.join(__dirname, '../../stack/docker-compose.yml');
  await fs.copyFile(src, path.join(dir, 'docker-compose.yml'));

  await execAsync('docker compose down', { cwd: dir, env: dockerEnv() });
  await execAsync('docker compose up -d', { cwd: dir, env: dockerEnv() });
});

ipcMain.handle('remove-vpn', async () => {
  const dir = composeDir();
  let env = await fs.readFile(path.join(dir, '.env'), 'utf8');
  env = env.replace(/^MULLVAD_PRIVATE_KEY=.*$/m, '').replace(/^MULLVAD_ADDRESSES=.*$/m, '').trim() + '\n';
  await fs.writeFile(path.join(dir, '.env'), env);

  const src = app.isPackaged
    ? path.join(process.resourcesPath, 'stack', 'docker-compose-novpn.yml')
    : path.join(__dirname, '../../stack/docker-compose-novpn.yml');
  await fs.copyFile(src, path.join(dir, 'docker-compose.yml'));

  await execAsync('docker compose down', { cwd: dir, env: dockerEnv() });
  await execAsync('docker compose up -d', { cwd: dir, env: dockerEnv() });
});
