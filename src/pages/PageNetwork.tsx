import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useT } from '../LangContext';
import ServiceIcon, { type ServiceName } from '../components/ServiceIcon';
import PageVpn from './PageVpn';

const SERVICES: { name: ServiceName; port: number }[] = [
  { name: 'Jellyfin',    port: 8096 },
  { name: 'Jellyseerr',  port: 5055 },
  { name: 'Radarr',      port: 7878 },
  { name: 'Sonarr',      port: 8989 },
  { name: 'Prowlarr',    port: 9696 },
  { name: 'qBittorrent', port: 8090 },
];

type Props = { config: Record<string, string>; onChanged: () => void; scrollToVpn?: boolean };

export default function PageNetwork({ config, onChanged, scrollToVpn }: Props) {
  const { t } = useT();
  const [ip, setIp] = useState<string>('...');
  const [copied, setCopied] = useState('');
  const [openService, setOpenService] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const vpnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.electron.getLocalIp().then((addr: string) => setIp(addr));
  }, []);

  useEffect(() => {
    if (scrollToVpn) {
      setTimeout(() => vpnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="flex flex-col gap-5 pt-6 px-5 pb-5">
      {/* Local IP */}
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-2)' }}>{t.net_local_title}</p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>{t.net_local_desc}</p>
        <div className="card-sm flex items-center gap-3" style={{ padding: '12px 16px' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{t.net_ip_label}</span>
          <span className="font-mono text-sm flex-1 font-semibold" style={{ color: 'var(--accent)' }}>{ip}</span>
          <button onClick={() => copy(ip, 'ip')} className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            {copied === 'ip' ? t.net_copied : t.net_copy}
          </button>
        </div>
      </div>

      {/* Service URLs — collapsed accordion */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{t.net_services_title}</p>
          <button
            onClick={() => { setShowAll(v => !v); setOpenService(null); }}
            className="btn-ghost"
            style={{ padding: '2px 8px', fontSize: '0.7rem' }}
          >
            {showAll ? t.net_collapse : t.net_show_all}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {SERVICES.map(s => {
            const url = `http://${ip}:${s.port}`;
            const isOpen = showAll || openService === s.name;
            return (
              <div key={s.name} className="card-sm overflow-hidden" style={{ padding: 0 }}>
                <button
                  onClick={() => !showAll && setOpenService(openService === s.name ? null : s.name)}
                  className="flex items-center gap-2 w-full"
                  style={{ padding: '7px 12px', background: 'none', border: 'none', cursor: showAll ? 'default' : 'pointer' }}
                >
                  <ServiceIcon name={s.name} size={16} />
                  <span className="text-xs font-medium flex-1 text-left" style={{ color: 'var(--text-2)' }}>{s.name}</span>
                  {!showAll && (isOpen
                    ? <ChevronUp size={11} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                    : <ChevronDown size={11} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  )}
                </button>
                {isOpen && (
                  <div className="flex items-center gap-2" style={{ padding: '4px 12px 7px', borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => window.electron.openExternal(url)}
                      className="font-mono text-xs flex-1 text-left truncate"
                      style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {url}
                    </button>
                    <button onClick={() => copy(url, s.name)} className="btn-ghost shrink-0" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                      {copied === s.name ? t.net_copied : t.net_copy}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* External access — Tailscale */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

      {/* VPN */}
      <div ref={vpnRef}>
        <PageVpn config={config} onChanged={onChanged} />
      </div>
    </div>
  );
}
