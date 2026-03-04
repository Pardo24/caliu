import { useState, useRef, useEffect } from 'react';
import { Home, Lock, Globe, Settings, ListChecks, ChevronUp } from 'lucide-react';
import { useT } from './LangContext';
import type { Lang } from './i18n';
import appIcon from '../assets/icons/icons/png/64x64.png';
import PageHome from './pages/PageHome';
import PageVpn from './pages/PageVpn';
import PageNetwork from './pages/PageNetwork';
import PageSettings from './pages/PageSettings';
import PageGuia from './pages/PageGuia';

type Page = 'home' | 'vpn' | 'network' | 'settings' | 'guide';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ca', label: 'CA' },
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
];

type Props = {
  initialConfig: Record<string, string>;
  onReinstall: () => void;
};

export default function Dashboard({ initialConfig, onReinstall }: Props) {
  const { t, lang, setLang } = useT();
  const [page, setPage] = useState<Page>('home');
  const [config, setConfig] = useState(initialConfig);

  const navItems: { id: Page; icon: React.ReactNode; label: string }[] = [
    { id: 'home',     icon: <Home        size={18} strokeWidth={1.75} />, label: t.nav_home },
    { id: 'vpn',      icon: <Lock        size={18} strokeWidth={1.75} />, label: t.nav_vpn },
    { id: 'network',  icon: <Globe       size={18} strokeWidth={1.75} />, label: t.nav_network },
    { id: 'guide',    icon: <ListChecks  size={18} strokeWidth={1.75} />, label: t.nav_guide },
    { id: 'settings', icon: <Settings    size={18} strokeWidth={1.75} />, label: t.nav_settings },
  ];

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const refreshConfig = async () => {
    const cfg = await window.electron.getConfig();
    if (cfg) setConfig(cfg);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="sidebar w-20 flex flex-col items-center pt-7 pb-4 gap-0.5 shrink-0">
        {/* Logo mark */}
        <div className="mb-5">
          <div className="logo-circle" style={{ width: 40, height: 40, borderRadius: 12, padding: 4, boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
            <img src={appIcon} alt="Caliu" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
          </div>
        </div>

        {/* Nav items */}
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`nav-btn ${page === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        {/* Language selector */}
        <div className="mt-auto pb-3" ref={langRef} style={{ position: 'relative' }}>
          {langOpen && (
            <div className="lang-popover">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setLangOpen(false); }}
                  className={`lang-btn ${lang === code ? 'active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <button className="lang-btn active" onClick={() => setLangOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {lang.toUpperCase()}
            <ChevronUp size={10} style={{ transform: langOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'rgba(246,248,255,0.55)' }}>
        <div style={{ height: '1px', background: 'var(--border)', flexShrink: 0 }} />
        <div className="flex-1 overflow-y-auto">
          {page === 'home'     && <PageHome config={config} />}
          {page === 'vpn'      && <PageVpn config={config} onChanged={refreshConfig} />}
          {page === 'network'  && <PageNetwork config={config} />}
          {page === 'guide'    && <PageGuia />}
          {page === 'settings' && <PageSettings onReinstall={onReinstall} />}
        </div>
      </div>
    </div>
  );
}
