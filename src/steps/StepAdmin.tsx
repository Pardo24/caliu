import { useState } from 'react';
import type { Config } from '../App';
import { useT } from '../LangContext';

type Props = { config: Config; updateConfig: (p: Partial<Config>) => void; next: () => void };

export default function StepAdmin({ config, updateConfig, next }: Props) {
  const { t } = useT();
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleNext = () => {
    if (config.adminPassword.length < 6) { setError(t.admin_err_short); return; }
    if (config.adminPassword !== confirm) { setError(t.admin_err_match); return; }
    next();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-8 text-center">
      <div>
        <h2 className="text-3xl font-bold mb-2">{t.admin_title}</h2>
        <p style={{ color: 'var(--text-2)' }}>
          {t.admin_user_label} <span className="font-mono font-semibold" style={{ color: 'var(--accent)' }}>admin</span>{t.admin_user_suffix}
        </p>
      </div>

      <div style={{ width: 320 }} className="space-y-5">
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            placeholder={t.admin_password}
            value={config.adminPassword}
            onChange={e => { updateConfig({ adminPassword: e.target.value }); setError(''); }}
            className="input-field"
            style={{ paddingRight: 44 }}
          />
          <button
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--text-3)' }}
          >
            {show ? '🙈' : '👁️'}
          </button>
        </div>

        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            placeholder={t.admin_confirm}
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError(''); }}
            className="input-field"
            style={{ paddingRight: 44 }}
          />
          <button
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--text-3)' }}
          >
            {show ? '🙈' : '👁️'}
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <button onClick={handleNext} disabled={!config.adminPassword || !confirm} className="btn-primary">
        {t.continue}
      </button>
    </div>
  );
}
