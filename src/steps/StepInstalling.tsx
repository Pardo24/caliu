import { useEffect, useState } from 'react';
import type { Config } from '../App';
import { useT } from '../LangContext';

type Props = { config: Config; updateConfig: (p: Partial<Config>) => void; next: () => void };

export default function StepInstalling({ config, next }: Props) {
  const { t } = useT();
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const interval = setInterval(() => {
          setStage(s => Math.min(s + 1, t.installing_stages.length - 1));
        }, 3000);

        await window.electron.install(config);
        clearInterval(interval);
        setStage(t.installing_stages.length - 1);
        setTimeout(next, 1000);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      }
    };
    run();
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-8 text-center">
      {!error ? (
        <>
          <div className="logo-circle" style={{ animation: 'spin 3s linear infinite' }}>⚙️</div>
          <h2 className="text-3xl font-bold">{t.installing_title}</h2>

          <div className="w-full max-w-md">
            <div className="progress-track mb-4">
              <div
                className="progress-fill"
                style={{ width: `${((stage + 1) / t.installing_stages.length) * 100}%` }}
              />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>{t.installing_stages[stage]}</p>
          </div>

          <p className="text-xs max-w-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>{t.installing_note}</p>
        </>
      ) : (
        <>
          <div className="text-6xl">❌</div>
          <h2 className="text-3xl font-bold text-red-500">{t.installing_error_title}</h2>
          <div className="card w-full max-w-md p-4 text-left">
            <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-2)', wordBreak: 'break-all' }}>{error}</p>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>{t.installing_error_note}</p>
        </>
      )}
    </div>
  );
}
