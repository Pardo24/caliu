import { useState } from 'react';
import { useT } from '../LangContext';

type Props = { config: Record<string, string>; onChanged: () => void };
type State = 'idle' | 'applying' | 'disabling' | 'ok' | 'error';

export default function PageVpn({ config, onChanged }: Props) {
  const { t } = useT();
  const vpnEnabled = !!config.MULLVAD_PRIVATE_KEY;

  const [key, setKey] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState<State>('idle');

  const handleEnable = async () => {
    setState('applying');
    try {
      await window.electron.addVpn({ mullvadKey: key, mullvadAddress: address });
      setState('ok');
      onChanged();
    } catch { setState('error'); }
  };

  const handleDisable = async () => {
    setState('disabling');
    try {
      await window.electron.removeVpn();
      setState('ok');
      onChanged();
    } catch { setState('error'); }
  };

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Status card */}
      <div className="card-sm flex items-center gap-3 px-4 py-3">
        <span className={`badge ${vpnEnabled ? 'running' : 'stopped'}`}>
          {vpnEnabled ? t.vpn_d_enabled : t.vpn_d_disabled}
        </span>
      </div>

      {state === 'ok' && (
        <p className="text-sm font-semibold text-green-600 px-1">{t.vpn_d_success}</p>
      )}
      {state === 'error' && (
        <p className="text-sm text-red-500 px-1">{t.vpn_d_error}</p>
      )}

      {/* Disable VPN */}
      {vpnEnabled && state !== 'ok' && (
        <button
          onClick={handleDisable}
          disabled={state === 'disabling'}
          className="btn-secondary"
          style={{ alignSelf: 'flex-start' }}
        >
          {state === 'disabling' ? t.vpn_d_disabling : t.vpn_d_disable_btn}
        </button>
      )}

      {/* Enable VPN form */}
      {!vpnEnabled && state !== 'ok' && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold">{t.vpn_d_add_title}</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
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
            value={key}
            onChange={e => { setKey(e.target.value); setState('idle'); }}
            className="input-field mono"
          />
          <input
            type="text"
            placeholder={t.vpn_address}
            value={address}
            onChange={e => { setAddress(e.target.value); setState('idle'); }}
            className="input-field mono"
          />
          <button
            onClick={handleEnable}
            disabled={!key || !address || state === 'applying'}
            className="btn-primary"
            style={{ minWidth: 'unset', padding: '10px 28px' }}
          >
            {state === 'applying' ? t.vpn_d_applying : t.vpn_d_enable_btn}
          </button>
        </div>
      )}
    </div>
  );
}
