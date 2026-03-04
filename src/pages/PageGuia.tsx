import { useState } from 'react';
import { CheckCircle2, Circle, ExternalLink, KeyRound } from 'lucide-react';
import { useT } from '../LangContext';
import type { Lang } from '../i18n';

const DONE_KEY = 'caliu_guide_done';

type Step = {
  id: string;
  port: number;
  title: Record<Lang, string>;
  items: Record<Lang, string[]>;
  cred: Record<Lang, string>;
};

const STEPS: Step[] = [
  {
    id: 'jellyfin',
    port: 8096,
    title: {
      ca: 'Configurar Jellyfin',
      es: 'Configurar Jellyfin',
      en: 'Set up Jellyfin',
    },
    items: {
      ca: [
        'El compte admin s\'ha creat automàticament amb la teva contrasenya de Caliu.',
        'Obre Jellyfin i inicia sessió amb usuari admin i la teva contrasenya.',
        'Dashboard → Libraries → Add Media Library',
        'Afegeix: Pel·lícules → /data/movies  i  Sèries → /data/series',
      ],
      es: [
        'La cuenta admin se ha creado automáticamente con tu contraseña de Caliu.',
        'Abre Jellyfin e inicia sesión con usuario admin y tu contraseña.',
        'Dashboard → Libraries → Add Media Library',
        'Añade: Películas → /data/movies  y  Series → /data/series',
      ],
      en: [
        'The admin account was auto-created with your Caliu password.',
        'Open Jellyfin and sign in with user admin and your password.',
        'Dashboard → Libraries → Add Media Library',
        'Add: Movies → /data/movies  and  TV Shows → /data/series',
      ],
    },
    cred: {
      ca: 'admin  ·  [la teva contrasenya de Caliu]',
      es: 'admin  ·  [tu contraseña de Caliu]',
      en: 'admin  ·  [your Caliu password]',
    },
  },
  {
    id: 'prowlarr',
    port: 9696,
    title: {
      ca: 'Afegir indexadors a Prowlarr',
      es: 'Añadir indexadores a Prowlarr',
      en: 'Add indexers to Prowlarr',
    },
    items: {
      ca: [
        'Sense contrasenya — accés directe.',
        'Indexers → Add Indexer → tria els que vulguis del catàleg.',
        'Anota la teva API Key: Settings → General → API Key',
      ],
      es: [
        'Sin contraseña — acceso directo.',
        'Indexers → Add Indexer → elige los que quieras del catálogo.',
        'Anota tu API Key: Settings → General → API Key',
      ],
      en: [
        'No password — direct access.',
        'Indexers → Add Indexer → pick whichever you want from the catalogue.',
        'Note your API Key: Settings → General → API Key',
      ],
    },
    cred: {
      ca: 'Sense contrasenya · Guarda la API Key per als passos següents',
      es: 'Sin contraseña · Guarda la API Key para los siguientes pasos',
      en: 'No password · Save the API Key for the next steps',
    },
  },
  {
    id: 'radarr',
    port: 7878,
    title: {
      ca: 'Configurar Radarr (pel·lícules)',
      es: 'Configurar Radarr (películas)',
      en: 'Configure Radarr (movies)',
    },
    items: {
      ca: [
        'Settings → Download Clients → Add → qBittorrent',
        'Host: localhost  ·  Port: 8090  ·  User: admin  ·  Pass: adminadmin',
        'Settings → Indexers → Add → Prowlarr',
        'URL: http://localhost:9696  ·  API Key: la del pas 2',
      ],
      es: [
        'Settings → Download Clients → Add → qBittorrent',
        'Host: localhost  ·  Port: 8090  ·  User: admin  ·  Pass: adminadmin',
        'Settings → Indexers → Add → Prowlarr',
        'URL: http://localhost:9696  ·  API Key: la del paso 2',
      ],
      en: [
        'Settings → Download Clients → Add → qBittorrent',
        'Host: localhost  ·  Port: 8090  ·  User: admin  ·  Pass: adminadmin',
        'Settings → Indexers → Add → Prowlarr',
        'URL: http://localhost:9696  ·  API Key: from step 2',
      ],
    },
    cred: {
      ca: 'Radarr: sense contrasenya · qBittorrent: admin / adminadmin',
      es: 'Radarr: sin contraseña · qBittorrent: admin / adminadmin',
      en: 'Radarr: no password · qBittorrent: admin / adminadmin',
    },
  },
  {
    id: 'sonarr',
    port: 8989,
    title: {
      ca: 'Configurar Sonarr (sèries)',
      es: 'Configurar Sonarr (series)',
      en: 'Configure Sonarr (TV shows)',
    },
    items: {
      ca: [
        'Settings → Download Clients → Add → qBittorrent',
        'Host: localhost  ·  Port: 8090  ·  User: admin  ·  Pass: adminadmin',
        'Settings → Indexers → Add → Prowlarr',
        'URL: http://localhost:9696  ·  API Key: la del pas 2',
      ],
      es: [
        'Settings → Download Clients → Add → qBittorrent',
        'Host: localhost  ·  Port: 8090  ·  User: admin  ·  Pass: adminadmin',
        'Settings → Indexers → Add → Prowlarr',
        'URL: http://localhost:9696  ·  API Key: la del paso 2',
      ],
      en: [
        'Settings → Download Clients → Add → qBittorrent',
        'Host: localhost  ·  Port: 8090  ·  User: admin  ·  Pass: adminadmin',
        'Settings → Indexers → Add → Prowlarr',
        'URL: http://localhost:9696  ·  API Key: from step 2',
      ],
    },
    cred: {
      ca: 'Sonarr: sense contrasenya · qBittorrent: admin / adminadmin',
      es: 'Sonarr: sin contraseña · qBittorrent: admin / adminadmin',
      en: 'Sonarr: no password · qBittorrent: admin / adminadmin',
    },
  },
  {
    id: 'jellyseerr',
    port: 5055,
    title: {
      ca: 'Connectar Jellyseerr',
      es: 'Conectar Jellyseerr',
      en: 'Connect Jellyseerr',
    },
    items: {
      ca: [
        'Obre Jellyseerr i segueix l\'assistent inicial.',
        'Quan et demani connectar Jellyfin, usa les credencials del pas 1.',
      ],
      es: [
        'Abre Jellyseerr y sigue el asistente inicial.',
        'Cuando te pida conectar Jellyfin, usa las credenciales del paso 1.',
      ],
      en: [
        'Open Jellyseerr and follow the initial setup wizard.',
        'When asked to connect Jellyfin, use the credentials from step 1.',
      ],
    },
    cred: {
      ca: 'admin  ·  [la teva contrasenya de Caliu]  (les mateixes que Jellyfin)',
      es: 'admin  ·  [tu contraseña de Caliu]  (las mismas que Jellyfin)',
      en: 'admin  ·  [your Caliu password]  (same as Jellyfin)',
    },
  },
];

const SUBTITLE: Record<Lang, string> = {
  ca: "Segueix aquests passos per posar-ho tot a punt.",
  es: "Sigue estos pasos para configurar todo.",
  en: "Follow these steps to get everything set up.",
};

const OPEN_LABEL: Record<Lang, string> = {
  ca: 'Obrir',
  es: 'Abrir',
  en: 'Open',
};

const DISCLAIMER: Record<Lang, string> = {
  ca: "⚠️ Caliu és una eina de gestió de serveis multimèdia. L'usuari és l'únic responsable del contingut que descarrega i de complir la legislació vigent al seu país.",
  es: "⚠️ Caliu es una herramienta de gestión de servicios multimedia. El usuario es el único responsable del contenido que descarga y de cumplir la legislación vigente en su país.",
  en: "⚠️ Caliu is a media service management tool. The user is solely responsible for the content they download and for complying with applicable law in their country.",
};

// Items that are indented "detail" rows (even-indexed after first = detail of previous)
function isDetail(i: number) { return i % 2 === 1; }

export default function PageGuia() {
  const { lang } = useT();
  const [done, setDone] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]'))
  );

  const toggle = (id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(DONE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const open = (port: number) => window.electron.openExternal(`http://localhost:${port}`);
  const completedCount = STEPS.filter(s => done.has(s.id)).length;

  return (
    <div className="flex flex-col gap-3 pt-5 px-5 pb-5">

      {/* Progress bar */}
      <div className="card-sm flex items-center justify-between" style={{ padding: '10px 16px' }}>
        <p className="text-xs" style={{ color: 'var(--text-2)' }}>{SUBTITLE[lang]}</p>
        <span className="text-xs font-semibold font-mono" style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: 8 }}>
          {completedCount}/{STEPS.length}
        </span>
      </div>

      {/* Steps */}
      {STEPS.map((step, i) => {
        const isDone = done.has(step.id);
        return (
          <div key={step.id} className="card-sm" style={{ opacity: isDone ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <div style={{ padding: '11px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>

              {/* Checkbox */}
              <button
                onClick={() => toggle(step.id)}
                style={{ flexShrink: 0, marginTop: 1, color: isDone ? 'var(--accent)' : 'var(--text-3)', lineHeight: 1 }}
              >
                {isDone ? <CheckCircle2 size={17} /> : <Circle size={17} />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title row */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold" style={{
                    color: isDone ? 'var(--text-3)' : 'var(--text)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}>
                    {i + 1}. {step.title[lang]}
                  </p>
                  <button
                    onClick={() => open(step.port)}
                    className="btn-ghost"
                    style={{ padding: '2px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}
                  >
                    <ExternalLink size={10} />
                    {OPEN_LABEL[lang]}
                  </button>
                </div>

                {/* Step items */}
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {step.items[lang].map((item, j) => (
                    <p key={j} className="text-xs" style={{
                      color: isDetail(j) ? 'var(--text-3)' : 'var(--text-2)',
                      paddingLeft: isDetail(j) ? 12 : 0,
                      fontFamily: isDetail(j) ? 'var(--font-mono, monospace)' : 'inherit',
                      fontSize: isDetail(j) ? '0.68rem' : '0.72rem',
                      lineHeight: 1.5,
                    }}>
                      {!isDetail(j) && <span style={{ color: 'var(--accent)', marginRight: 5 }}>›</span>}
                      {item}
                    </p>
                  ))}
                </div>

                {/* Credential hint */}
                <div className="flex items-center gap-1.5" style={{ marginTop: 7 }}>
                  <KeyRound size={10} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.68rem', color: 'var(--accent)', opacity: 0.75, fontFamily: 'monospace' }}>
                    {step.cred[lang]}
                  </p>
                </div>

              </div>
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      {completedCount < STEPS.length && (
        <div style={{ padding: '10px 14px', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 10 }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
            {DISCLAIMER[lang]}
          </p>
        </div>
      )}

      {/* Celebration */}
      {completedCount === STEPS.length && (
        <div className="card" style={{
          padding: '28px 24px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(251,146,60,0.03) 100%)',
          border: '1px solid rgba(249,115,22,0.22)',
          animation: 'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Floating particles */}
          {(['✨','🎊','✨','🎉','✨','🎊'] as const).map((emoji, i) => (
            <span key={i} aria-hidden style={{
              position: 'absolute',
              fontSize: 16 + (i % 3) * 4,
              animation: `floatUp ${1.4 + i * 0.35}s ease-out ${i * 0.25}s infinite`,
              left: `${8 + i * 14}%`,
              bottom: '6%',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>{emoji}</span>
          ))}

          <div style={{ fontSize: '2.2rem', marginBottom: 8, position: 'relative' }}>🎉</div>
          <h3 className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: 4 }}>
            {lang === 'ca' ? 'Tot llest!' : lang === 'es' ? '¡Todo listo!' : "You're all set!"}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.5 }}>
            {lang === 'ca' ? 'Caliu ja està completament configurat i llest per usar.' :
             lang === 'es' ? 'Caliu ya está completamente configurado y listo para usar.' :
             'Caliu is fully configured and ready to use.'}
          </p>
          <button
            onClick={() => window.electron.openExternal('http://localhost:5055')}
            className="btn-primary"
            style={{ animation: 'celebGlow 2s ease-in-out infinite', minWidth: 'unset', padding: '12px 28px', fontSize: '0.95rem', position: 'relative' }}
          >
            {lang === 'ca' ? '🍿 Comença a demanar sèries!' :
             lang === 'es' ? '🍿 ¡Empieza a pedir series!' :
             '🍿 Start requesting content!'}
          </button>
        </div>
      )}

    </div>
  );
}
