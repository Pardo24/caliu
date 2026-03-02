import type { Config } from '../App';
import { useT } from '../LangContext';

type Props = { config: Config; updateConfig: (p: Partial<Config>) => void; next: () => void };

export default function StepVpn({ config, updateConfig, next }: Props) {
  const { t } = useT();

  return (
    <div className="h-full flex flex-col items-center justify-center gap-7 px-8 text-center">
      <div>
        <h2 className="text-3xl font-bold mb-2">{t.vpn_title}</h2>
        <p className="max-w-md" style={{ color: 'var(--text-2)' }}>{t.vpn_desc}</p>
      </div>

      <div className="w-full max-w-md space-y-3">
        {/* No VPN */}
        <button
          onClick={() => { updateConfig({ vpnEnabled: false }); next(); }}
          className="card-sm w-full px-6 py-4 text-left transition-all hover:shadow-md"
        >
          <p className="font-semibold">{t.vpn_no}</p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>{t.vpn_no_desc}</p>
        </button>

        {/* Mullvad VPN */}
        <button
          onClick={() => updateConfig({ vpnEnabled: true })}
          className="card-sm w-full px-6 py-4 text-left transition-all"
          style={config.vpnEnabled ? {
            borderColor: 'var(--accent)',
            background: 'rgba(249,115,22,0.04)',
            boxShadow: '0 0 0 2px rgba(249,115,22,0.2)'
          } : {}}
        >
          <p className="font-semibold">
            {t.vpn_yes}
            <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--accent)' }}>
              {t.vpn_yes_tag}
            </span>
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>{t.vpn_yes_desc}</p>
        </button>
      </div>

      {config.vpnEnabled && (
        <div className="w-full max-w-sm space-y-4">
          <p className="text-sm text-left" style={{ color: 'var(--text-2)' }}>
            <button
              onClick={() => window.electron.openExternal('https://mullvad.net')}
              className="font-semibold underline"
              style={{ color: 'var(--accent)' }}
            >mullvad.net
            </button>
            {' '}{t.vpn_instructions}
          </p>
          <input
            type="text"
            placeholder={t.vpn_key}
            value={config.mullvadKey}
            onChange={e => updateConfig({ mullvadKey: e.target.value })}
            className="input-field mono"
          />
          <input
            type="text"
            placeholder={t.vpn_address}
            value={config.mullvadAddress}
            onChange={e => updateConfig({ mullvadAddress: e.target.value })}
            className="input-field mono"
          />
          <button
            onClick={next}
            disabled={!config.mullvadKey || !config.mullvadAddress}
            className="btn-primary w-full"
          >
            {t.install}
          </button>
        </div>
      )}
    </div>
  );
}
