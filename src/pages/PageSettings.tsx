import { useState, useEffect } from 'react';
import { useT } from '../LangContext';
import type { Lang } from '../i18n';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ca', label: 'Català' },
  { code: 'es', label: 'Castellano' },
  { code: 'en', label: 'English' },
];

export default function PageSettings({ onReinstall }: { onReinstall: () => void }) {
  const { t, lang, setLang } = useT();
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [version, setVersion] = useState('…');

  useEffect(() => { window.electron.getVersion().then(setVersion).catch(() => setVersion('—')); }, []);

  const doReinstall = async () => {
    setWorking(true);
    await window.electron.resetInstall();
    onReinstall();
  };

  return (
    <div className="flex flex-col gap-4 pt-6 px-5 pb-5">
      {/* Language */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 className="text-sm font-semibold mb-4">{t.cfg_lang_label}</h3>
        <div className="flex gap-2 flex-wrap">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={lang === code ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 20px', minWidth: 'unset', fontSize: '0.875rem' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="card-sm flex items-center gap-3" style={{ padding: '12px 16px' }}>
        <span className="text-sm" style={{ color: 'var(--text-2)' }}>{t.cfg_version_label}</span>
        <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>{version}</span>
      </div>

      {/* Reinstall */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 className="text-sm font-semibold">{t.cfg_reinstall_label}</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{t.cfg_reinstall_desc}</p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="btn-secondary"
            style={{ borderColor: 'rgba(220,38,38,0.2)', color: '#dc2626' }}
          >
            {t.cfg_reinstall_btn}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-red-500 font-medium">{t.cfg_reinstall_confirm}</p>
            <div className="flex gap-2">
              <button
                onClick={doReinstall}
                disabled={working}
                className="btn-secondary"
                style={{ borderColor: 'rgba(220,38,38,0.4)', color: '#dc2626', background: 'rgba(220,38,38,0.05)' }}
              >
                {t.cfg_reinstall_yes}
              </button>
              <button onClick={() => setConfirming(false)} className="btn-ghost">
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
