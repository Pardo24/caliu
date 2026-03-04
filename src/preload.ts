import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  checkDocker:  ()                  => ipcRenderer.invoke('check-docker'),
  pickFolder:   ()                  => ipcRenderer.invoke('pick-folder'),
  install:      (config: unknown)   => ipcRenderer.invoke('install', config),
  addVpn:       (creds: unknown)    => ipcRenderer.invoke('add-vpn', creds),
  removeVpn:    ()                  => ipcRenderer.invoke('remove-vpn'),
  getConfig:    ()                  => ipcRenderer.invoke('get-config'),
  getStatus:    ()                  => ipcRenderer.invoke('get-status'),
  startStack:   ()                  => ipcRenderer.invoke('start-stack'),
  stopStack:    ()                  => ipcRenderer.invoke('stop-stack'),
  getLocalIp:   ()                  => ipcRenderer.invoke('get-local-ip'),
  resetInstall: ()                  => ipcRenderer.invoke('reset-install'),
  openExternal: (url: string)       => ipcRenderer.invoke('open-external', url),
  getVersion:   ()                  => ipcRenderer.invoke('get-version'),
});
