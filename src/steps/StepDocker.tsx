import { useEffect, useState } from 'react';
import type { Config } from '../App';
import { useT } from '../LangContext';

type Props = { config: Config; updateConfig: (p: Partial<Config>) => void; next: () => void };
type Status = 'checking' | 'ok' | 'missing';

export default function StepDocker({ next }: Props) {
  const { t } = useT();
  const [status, setStatus] = useState<Status>('checking');

  const check = () => {
    setStatus('checking');
    window.electron.checkDocker().then((ok: boolean) => setStatus(ok ? 'ok' : 'missing'));
  };

  useEffect(() => { check(); }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-8 text-center">
      <div>
        <h2 className="text-3xl font-bold mb-2">{t.docker_title}</h2>
        <p style={{ color: 'var(--text-2)' }}>{t.docker_desc}</p>
      </div>

      {status === 'checking' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-full border-3 spin" style={{ border: '3px solid var(--accent)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-2)' }}>{t.docker_checking}</p>
        </div>
      )}

      {status === 'ok' && (
        <div className="card px-8 py-6 flex flex-col items-center gap-5">
          <div className="text-5xl">✅</div>
          <p className="font-semibold text-green-600">{t.docker_ok}</p>
          <button onClick={next} className="btn-primary">{t.continue}</button>
        </div>
      )}

      {status === 'missing' && (
        <div className="card px-8 py-6 flex flex-col items-center gap-5 max-w-sm w-full">
          <div className="text-5xl">⚠️</div>
          <p className="font-semibold text-amber-600">{t.docker_missing}</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{t.docker_missing_desc}</p>
          <button
            onClick={() => window.electron.openExternal('https://www.docker.com/products/docker-desktop/')}
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}
          >
            {t.docker_download}
          </button>
          <button onClick={check} className="btn-ghost text-sm underline">
            {t.docker_retry}
          </button>
        </div>
      )}
    </div>
  );
}
