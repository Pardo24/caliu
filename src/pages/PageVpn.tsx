import { useState } from 'react';
import type React from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Lock, Zap, EyeOff, CheckCircle2 } from 'lucide-react';
import { useT } from '../LangContext';

type Props = { config: Record<string, string>; onChanged: () => void };
type State = 'idle' | 'applying' | 'disabling' | 'ok' | 'error';

export default function PageVpn({ config, onChanged }: Props) {
  const { t } = useT();
  const vpnEnabled = !!config.MULLVAD_PRIVATE_KEY;

  const [key, setKey] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState<State>('idle');
  const [showInfo, setShowInfo] = useState(false);

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
    <div className="flex flex-col gap-4 pt-6 px-5 pb-5">

      {/* Status */}
      <div className="card-sm flex items-center gap-3" style={{ padding: '12px 16px' }}>
        <span className={`badge ${vpnEnabled ? 'running' : 'stopped'}`}>
          {vpnEnabled ? t.vpn_d_enabled : t.vpn_d_disabled}
        </span>
      </div>

      {/* Why VPN info box */}
      <div className="card-sm overflow-hidden">
        <button onClick={() => setShowInfo(v => !v)}
          className="w-full flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} strokeWidth={2} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>
              {t.vpn_why_title ?? 'Why use a VPN?'}
            </span>
          </div>
          {showInfo
            ? <ChevronUp size={14} style={{ color: 'var(--text-3)' }} />
            : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />
          }
        </button>
        {showInfo && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([
              { icon: <Lock size={13} />, text: t.vpn_why_1 },
              { icon: <Zap size={13} />, text: t.vpn_why_2 },
              { icon: <EyeOff size={13} />, text: t.vpn_why_3 },
              { icon: <CheckCircle2 size={13} />, text: t.vpn_why_4 },
            ] as { icon: React.ReactNode; text: string }[]).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {state === 'ok' && (
        <p className="text-sm font-semibold text-green-600 px-1">{t.vpn_d_success}</p>
      )}
      {state === 'error' && (
        <p className="text-sm text-red-500 px-1">{t.vpn_d_error}</p>
      )}

      {/* Disable */}
      {vpnEnabled && state !== 'ok' && (
        <button onClick={handleDisable} disabled={state === 'disabling'}
          className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
          {state === 'disabling' ? t.vpn_d_disabling : t.vpn_d_disable_btn}
        </button>
      )}

      {/* Enable form */}
      {!vpnEnabled && state !== 'ok' && (
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 className="font-semibold text-sm">{t.vpn_d_add_title}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
              {t.vpn_compatible ?? 'Compatible with any WireGuard VPN provider (Mullvad, IVPN, ProtonVPN…)'}
            </p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
            <button onClick={() => window.electron.openExternal('https://mullvad.net')}
              className="font-semibold underline" style={{ color: 'var(--accent)' }}>mullvad.net
            </button>
            {' '}{t.vpn_instructions}
          </p>
          <input type="text" placeholder={t.vpn_key} value={key}
            onChange={e => { setKey(e.target.value); setState('idle'); }}
            className="input-field mono" />
          <input type="text" placeholder={t.vpn_address} value={address}
            onChange={e => { setAddress(e.target.value); setState('idle'); }}
            className="input-field mono" />
          <button onClick={handleEnable} disabled={!key || !address || state === 'applying'}
            className="btn-primary" style={{ minWidth: 'unset', padding: '10px 28px' }}>
            {state === 'applying' ? t.vpn_d_applying : t.vpn_d_enable_btn}
          </button>
        </div>
      )}
    </div>
  );
}
