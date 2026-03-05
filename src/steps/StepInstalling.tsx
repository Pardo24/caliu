import { useEffect, useState } from 'react';
import { Check, Loader } from 'lucide-react';
import type { Config } from '../App';
import { useT } from '../LangContext';

type Props = { config: Config; updateConfig: (p: Partial<Config>) => void; next: () => void };

export default function StepInstalling({ config, next }: Props) {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const total = t.installing_stages.length;

  useEffect(() => {
    window.electron.onInstallProgress((s: number) => setStep(s));

    const run = async () => {
      try {
        await window.electron.install(config);
        setStep(total - 1);
        setTimeout(next, 800);
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

          <div className="w-full max-w-md flex flex-col gap-2">
            {t.installing_stages.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 12px', borderRadius: 10,
                    background: active ? 'rgba(var(--accent-rgb,249,115,22),0.07)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? 'var(--accent)' : active ? 'var(--accent)' : 'var(--border)',
                    color: done || active ? '#fff' : 'var(--text-3)',
                  }}>
                    {done
                      ? <Check size={12} strokeWidth={3} />
                      : active
                        ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
                        : <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{i + 1}</span>
                    }
                  </span>
                  <span style={{
                    fontSize: '0.8rem', textAlign: 'left',
                    color: done ? 'var(--text-3)' : active ? 'var(--text)' : 'var(--text-3)',
                    fontWeight: active ? 600 : 400,
                  }}>
                    {label}
                  </span>
                </div>
              );
            })}
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