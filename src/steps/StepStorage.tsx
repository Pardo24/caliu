import { useState } from 'react';
import type { Config } from '../App';
import { useT } from '../LangContext';

type Props = { config: Config; updateConfig: (p: Partial<Config>) => void; next: () => void };

export default function StepStorage({ config, updateConfig, next }: Props) {
  const { t } = useT();
  const [error, setError] = useState('');

  const pickFolder = async () => {
    const p = await window.electron.pickFolder();
    if (p) updateConfig({ dataPath: p });
  };

  const handleNext = () => {
    if (!config.dataPath) { setError(t.storage_error); return; }
    next();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-8 text-center">
      <div>
        <h2 className="text-3xl font-bold mb-2">{t.storage_title}</h2>
        <p style={{ color: 'var(--text-2)' }}>{t.storage_desc}</p>
      </div>

      <div className="w-full max-w-md space-y-3">
        <button
          onClick={pickFolder}
          className="card w-full px-6 py-4 text-left transition-all hover:shadow-lg"
          style={{ cursor: 'pointer' }}
        >
          {config.dataPath ? (
            <div>
              <p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-3)' }}>{t.storage_selected_label}</p>
              <p className="font-mono text-sm truncate" style={{ color: 'var(--accent)' }}>{config.dataPath}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3" style={{ color: 'var(--text-2)' }}>
              <span className="text-2xl">📁</span>
              <span>{t.storage_placeholder}</span>
            </div>
          )}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <p className="text-xs max-w-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>{t.storage_note}</p>

      <button onClick={handleNext} disabled={!config.dataPath} className="btn-primary">
        {t.continue}
      </button>
    </div>
  );
}
