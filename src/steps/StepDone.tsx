import { useState } from 'react';
import type { Config } from '../App';
import { useT } from '../LangContext';

type Props = { config: Config; updateConfig: (p: Partial<Config>) => void; next: () => void };
type VpnState = 'idle' | 'loading' | 'ok' | 'error';

export default function StepDone({ config, next }: Props) {
  const { t } = useT();
  const open = (url: string) => window.electron.openExternal(url);

  const [showVpn, setShowVpn] = useState(false);
  const [vpnKey, setVpnKey] = useState('');
  const [vpnAddress, setVpnAddress] = useState('');
  const [vpnState, setVpnState] = useState<VpnState>('idle');

  const handleAddVpn = async () => {
    setVpnState('loading');
    try {
      await window.electron.addVpn({ mullvadKey: vpnKey, mullvadAddress: vpnAddress });
      setVpnState('ok');
    } catch {
      setVpnState('error');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 px-8 text-center overflow-y-auto py-6">
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold gradient-title">{t.done_title}</h2>
        <p className="text-sm max-w-md" style={{ color: 'var(--text-2)' }}>{t.done_desc}</p>
      </div>

      {/* Service buttons */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
        {[
          { url: 'http://localhost:8096', icon: '🎬', name: 'Jellyfin',   sub: t.done_cinema },
          { url: 'http://localhost:5055', icon: '🔍', name: 'Jellyseerr', sub: t.done_request },
          { url: 'http://localhost:7878', icon: '🎥', name: 'Radarr',     sub: t.done_movies },
          { url: 'http://localhost:8989', icon: '📺', name: 'Sonarr',     sub: t.done_series },
        ].map(s => (
          <button
            key={s.name}
            onClick={() => open(s.url)}
            className="card-sm flex flex-col items-center gap-2 px-4 py-4 transition-all hover:shadow-md"
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="font-semibold text-sm">{s.name}</span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>{s.sub}</span>
          </button>
        ))}
      </div>

      {/* Indexer block */}
      <div className="card w-full max-w-md p-4 text-left space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔌</span>
          <span className="font-semibold text-sm">{t.done_indexer_title}</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {t.done_indexer_p1}<strong>{t.done_indexer_bold}</strong>{t.done_indexer_p2}
        </p>
        <button
          onClick={() => open('http://localhost:9696')}
          className="btn-secondary w-full justify-center"
        >
          {t.done_indexer_btn}
        </button>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{t.done_indexer_disclaimer}</p>
      </div>

      {/* Add VPN section (shown if not enabled) */}
      {!config.vpnEnabled && (
        <div className="card w-full max-w-md p-4 text-left space-y-3">
          <button
            onClick={() => setShowVpn(v => !v)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <span className="font-semibold text-sm">{t.done_vpn_title}</span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>{showVpn ? '▲' : '▼'}</span>
          </button>

          {showVpn && (
            <div className="space-y-3 pt-1">
              {vpnState === 'ok' ? (
                <p className="text-green-600 text-sm font-semibold">{t.done_vpn_success}</p>
              ) : (
                <>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    <button onClick={() => open('https://mullvad.net')} className="font-semibold underline" style={{ color: 'var(--accent)' }}>mullvad.net</button>
                    {' '}{t.vpn_instructions}
                  </p>
                  <input type="text" placeholder={t.done_vpn_key} value={vpnKey} onChange={e => setVpnKey(e.target.value)} className="input-field mono" />
                  <input type="text" placeholder={t.done_vpn_address} value={vpnAddress} onChange={e => setVpnAddress(e.target.value)} className="input-field mono" />
                  {vpnState === 'error' && <p className="text-red-500 text-xs">{t.done_vpn_error}</p>}
                  <button
                    onClick={handleAddVpn}
                    disabled={!vpnKey || !vpnAddress || vpnState === 'loading'}
                    className="btn-primary w-full"
                    style={{ padding: '10px 24px', minWidth: 'unset' }}
                  >
                    {vpnState === 'loading' ? '...' : t.done_vpn_btn}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <button onClick={next} className="btn-primary">{t.continue}</button>

      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{t.done_network}</p>
    </div>
  );
}
