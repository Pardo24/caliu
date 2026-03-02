import { useState, useEffect } from 'react';
import { useT } from '../LangContext';

const SERVICES = [
  { name: 'Jellyfin',    port: 8096 },
  { name: 'Jellyseerr',  port: 5055 },
  { name: 'Radarr',      port: 7878 },
  { name: 'Sonarr',      port: 8989 },
  { name: 'Prowlarr',    port: 9696 },
  { name: 'qBittorrent', port: 8090 },
];

export default function PageNetwork({ config: _config }: { config: Record<string, string> }) {
  const { t } = useT();
  const [ip, setIp] = useState<string>('...');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    window.electron.getLocalIp().then((addr: string) => setIp(addr));
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Local IP */}
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-2)' }}>{t.net_local_title}</p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>{t.net_local_desc}</p>
        <div className="card-sm flex items-center gap-3 px-4 py-3">
          <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{t.net_ip_label}</span>
          <span className="font-mono text-sm flex-1 font-semibold" style={{ color: 'var(--accent)' }}>{ip}</span>
          <button onClick={() => copy(ip, 'ip')} className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            {copied === 'ip' ? t.net_copied : t.net_copy}
          </button>
        </div>
      </div>

      {/* Service URLs */}
      <div>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-2)' }}>{t.net_services_title}</p>
        <div className="space-y-2">
          {SERVICES.map(s => {
            const url = `http://${ip}:${s.port}`;
            return (
              <div key={s.name} className="card-sm flex items-center gap-3 px-4 py-2.5">
                <span className="text-xs font-medium shrink-0" style={{ width: 90, color: 'var(--text-2)' }}>{s.name}</span>
                <button
                  onClick={() => window.electron.openExternal(url)}
                  className="font-mono text-xs flex-1 text-left truncate"
                  style={{ color: '#3b82f6' }}
                >
                  {url}
                </button>
                <button onClick={() => copy(url, s.name)} className="btn-ghost shrink-0" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                  {copied === s.name ? t.net_copied : t.net_copy}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* External access — Tailscale */}
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">{t.net_external_title}</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{t.net_external_desc}</p>
        <button
          onClick={() => window.electron.openExternal('https://tailscale.com/download')}
          className="btn-secondary"
        >
          {t.net_tailscale_btn}
        </button>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{t.net_tailscale_desc}</p>
      </div>
    </div>
  );
}
