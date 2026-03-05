import { useState } from 'react';
import { CheckCircle2, ExternalLink, Lightbulb, BookOpen } from 'lucide-react';
import { useT } from '../LangContext';
import type { Lang } from '../i18n';
import ServiceIcon, { type ServiceName } from '../components/ServiceIcon';

const DONE_KEY = 'gecko_guide_done';

type Step = {
  id: string;
  serviceName: ServiceName;
  port: number;
  required: boolean;
  title: Record<Lang, string>;
  intro: Record<Lang, string>;
  items: Record<Lang, { label?: string; detail?: string }[]>;
  tips?: Record<Lang, string[]>;
  wikiUrl?: string;
};

const STEPS: Step[] = [
  {
    id: 'prowlarr',
    serviceName: 'Prowlarr',
    port: 9696,
    required: true,
    title: {
      ca: 'Afegir indexadors a Prowlarr',
      es: 'Añadir indexadores a Prowlarr',
      en: 'Add indexers to Prowlarr',
    },
    intro: {
      ca: "L'únic pas manual. Gecko ha configurat totes les connexions — només cal dir-li on buscar contingut.",
      es: 'El único paso manual. Gecko ha configurado todas las conexiones — solo hay que decirle dónde buscar contenido.',
      en: 'The only manual step. Gecko has configured all connections — you just need to tell it where to find content.',
    },
    items: {
      ca: [
        { label: 'Obre Prowlarr i ves a Indexers → Add Indexer.' },
        { label: 'Cerca i afegeix els indexadors que vulguis del catàleg disponible.' },
        { label: 'Prowlarr sincronitzarà automàticament els indexadors a Radarr, Sonarr i Lidarr.' },
      ],
      es: [
        { label: 'Abre Prowlarr y ve a Indexers → Add Indexer.' },
        { label: 'Busca y añade los indexadores que quieras del catálogo disponible.' },
        { label: 'Prowlarr sincronizará automáticamente los indexadores a Radarr, Sonarr y Lidarr.' },
      ],
      en: [
        { label: 'Open Prowlarr and go to Indexers → Add Indexer.' },
        { label: 'Search and add whichever indexers you want from the catalogue.' },
        { label: 'Prowlarr will automatically sync the indexers to Radarr, Sonarr and Lidarr.' },
      ],
    },
    tips: {
      ca: [
        'Cerca "best public indexers Prowlarr 2024" a Google per trobar llistes actualitzades.',
        'Pregunta a ChatGPT: "quins indexadors públics recomanes per a Prowlarr?"',
        'Els indexadors públics no requereixen registre i cobreixen la majoria del contingut.',
      ],
      es: [
        'Busca "best public indexers Prowlarr 2024" en Google para encontrar listas actualizadas.',
        'Pregunta a ChatGPT: "¿qué indexadores públicos recomiendas para Prowlarr?"',
        'Los indexadores públicos no requieren registro y cubren la mayoría del contenido.',
      ],
      en: [
        'Search "best public indexers Prowlarr 2024" on Google for updated lists.',
        'Ask ChatGPT: "which public indexers do you recommend for Prowlarr?"',
        'Public indexers require no registration and cover most content.',
      ],
    },
    wikiUrl: 'https://wiki.servarr.com/prowlarr/indexers',
  },
  {
    id: 'jellyfin',
    serviceName: 'Jellyfin',
    port: 8096,
    required: false,
    title: {
      ca: 'Afegir biblioteques a Jellyfin',
      es: 'Añadir bibliotecas a Jellyfin',
      en: 'Add libraries to Jellyfin',
    },
    intro: {
      ca: "Perquè Jellyfin mostri el contingut organitzat cal afegir les biblioteques. L'usuari admin s'ha creat automàticament.",
      es: 'Para que Jellyfin muestre el contenido organizado hay que añadir las bibliotecas. El usuario admin se ha creado automáticamente.',
      en: 'To have Jellyfin display content in an organised way you need to add libraries. The admin user was created automatically.',
    },
    items: {
      ca: [
        { label: "Inicia sessió amb usuari admin i la teva contrasenya de Gecko." },
        { label: 'Dashboard → Libraries → Add Media Library.' },
        { label: "Afegeix Pel·lícules:", detail: 'Tipus: Movies  ·  Ruta: /media/movies' },
        { label: 'Afegeix Sèries:', detail: 'Tipus: Shows  ·  Ruta: /media/series' },
        { label: 'Afegeix Música (opcional):', detail: 'Tipus: Music  ·  Ruta: /media/music' },
      ],
      es: [
        { label: 'Inicia sesión con usuario admin y tu contraseña de Gecko.' },
        { label: 'Dashboard → Libraries → Add Media Library.' },
        { label: 'Añade Películas:', detail: 'Tipo: Movies  ·  Ruta: /media/movies' },
        { label: 'Añade Series:', detail: 'Tipo: Shows  ·  Ruta: /media/series' },
        { label: 'Añade Música (opcional):', detail: 'Tipo: Music  ·  Ruta: /media/music' },
      ],
      en: [
        { label: 'Sign in with user admin and your Gecko password.' },
        { label: 'Dashboard → Libraries → Add Media Library.' },
        { label: 'Add Movies:', detail: 'Type: Movies  ·  Path: /media/movies' },
        { label: 'Add TV Shows:', detail: 'Type: Shows  ·  Path: /media/series' },
        { label: 'Add Music (optional):', detail: 'Type: Music  ·  Path: /media/music' },
      ],
    },
  },
  {
    id: 'bazarr',
    serviceName: 'Bazarr',
    port: 6767,
    required: false,
    title: {
      ca: 'Configurar subtítols a Bazarr',
      es: 'Configurar subtítulos en Bazarr',
      en: 'Set up subtitles in Bazarr',
    },
    intro: {
      ca: 'Bazarr descarrega subtítols automàticament. Ja està connectat a Radarr i Sonarr — només cal triar l\'idioma i el proveïdor.',
      es: 'Bazarr descarga subtítulos automáticamente. Ya está conectado a Radarr y Sonarr — solo hay que elegir el idioma y el proveedor.',
      en: 'Bazarr downloads subtitles automatically. It is already connected to Radarr and Sonarr — just pick your language and provider.',
    },
    items: {
      ca: [
        { label: 'Settings → Languages → afegeix els idiomes que vols (ex: Català, Castellà).' },
        { label: 'Settings → Providers → Add Provider.' },
        { detail: 'OpenSubtitles.com (compte gratuït) és el més recomanat.' },
        { label: 'Bazarr buscarà subtítols automàticament quan arribi nou contingut.' },
      ],
      es: [
        { label: 'Settings → Languages → añade los idiomas que quieres (ej: Español, Catalán).' },
        { label: 'Settings → Providers → Add Provider.' },
        { detail: 'OpenSubtitles.com (cuenta gratuita) es el más recomendado.' },
        { label: 'Bazarr buscará subtítulos automáticamente cuando llegue nuevo contenido.' },
      ],
      en: [
        { label: 'Settings → Languages → add the languages you want (e.g. English, Spanish).' },
        { label: 'Settings → Providers → Add Provider.' },
        { detail: 'OpenSubtitles.com (free account) is the most recommended.' },
        { label: 'Bazarr will automatically fetch subtitles whenever new content arrives.' },
      ],
    },
  },
];

const SUBTITLE: Record<Lang, string> = {
  ca: 'Gecko ha configurat automàticament totes les connexions. Completa els passos que queden:',
  es: 'Gecko ha configurado automáticamente todas las conexiones. Completa los pasos que quedan:',
  en: 'Gecko has automatically configured all service connections. Complete the remaining steps:',
};

const REQUIRED_BADGE: Record<Lang, string> = {
  ca: 'Necessari',
  es: 'Necesario',
  en: 'Required',
};

const OPTIONAL_BADGE: Record<Lang, string> = {
  ca: 'Opcional',
  es: 'Opcional',
  en: 'Optional',
};

const OPEN_LABEL: Record<Lang, string> = { ca: 'Obrir', es: 'Abrir', en: 'Open' };
const MARK_DONE:  Record<Lang, string> = { ca: 'Marcar fet', es: 'Marcar hecho', en: 'Mark done' };
const MARK_UNDO:  Record<Lang, string> = { ca: 'Desmarcar', es: 'Desmarcar', en: 'Undo' };
const TIPS_LABEL: Record<Lang, string> = { ca: 'Consells', es: 'Consejos', en: 'Tips' };
const WIKI_LABEL: Record<Lang, string> = { ca: 'Wiki oficial', es: 'Wiki oficial', en: 'Official wiki' };

const DISCLAIMER: Record<Lang, string> = {
  ca: "⚠️ Gecko és una eina de gestió de serveis multimèdia. L'usuari és l'únic responsable del contingut que descarrega i de complir la legislació vigent al seu país.",
  es: '⚠️ Gecko es una herramienta de gestión de servicios multimedia. El usuario es el único responsable del contenido que descarga y de cumplir la legislación vigente en su país.',
  en: '⚠️ Gecko is a media service management tool. The user is solely responsible for the content they download and for complying with applicable law in their country.',
};

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
  const total = STEPS.length;

  return (
    <div className="flex flex-col gap-4 pt-5 px-5 pb-5">

      {/* Progress header */}
      <div className="card-sm" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{SUBTITLE[lang]}</p>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace', flexShrink: 0, marginLeft: 8 }}>
            {completedCount}/{total}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(completedCount / total) * 100}%` }} />
        </div>
      </div>

      {/* Steps */}
      {STEPS.map((step, i) => {
        const isDone = done.has(step.id);
        return (
          <div
            key={step.id}
            className="card"
            style={{
              overflow: 'hidden',
              opacity: isDone ? 0.6 : 1,
              transition: 'opacity 0.2s',
              border: isDone
                ? '1px solid rgba(34,197,94,0.25)'
                : step.required
                  ? '1.5px solid var(--accent)'
                  : '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              {/* Step number */}
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: isDone ? 'rgba(34,197,94,0.12)' : 'var(--accent-g)',
                color: isDone ? '#22c55e' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1rem',
                boxShadow: isDone ? 'none' : '0 3px 12px rgba(13,148,136,0.28)',
                transition: 'all 0.2s',
              }}>
                {isDone
                  ? <CheckCircle2 size={22} strokeWidth={2.5} />
                  : String(i + 1).padStart(2, '0')}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                  <ServiceIcon name={step.serviceName} size={17} />
                  <p style={{
                    fontWeight: 700, fontSize: '0.95rem', flex: 1,
                    color: isDone ? 'var(--text-3)' : 'var(--text)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}>
                    {step.title[lang]}
                  </p>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                    background: step.required ? 'rgba(var(--accent-rgb,13,148,136),0.12)' : 'rgba(0,0,0,0.06)',
                    color: step.required ? 'var(--accent)' : 'var(--text-3)',
                  }}>
                    {step.required ? REQUIRED_BADGE[lang] : OPTIONAL_BADGE[lang]}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.45, marginBottom: 10 }}>
                  {step.intro[lang]}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => open(step.port)}
                    className="btn-secondary"
                    style={{ padding: '5px 14px', fontSize: '0.75rem', gap: 5, display: 'inline-flex', alignItems: 'center' }}
                  >
                    <ExternalLink size={11} />{OPEN_LABEL[lang]}
                  </button>
                  <button
                    onClick={() => toggle(step.id)}
                    className="btn-ghost"
                    style={{ padding: '5px 12px', fontSize: '0.75rem', color: isDone ? '#22c55e' : 'var(--text-3)' }}
                  >
                    {isDone ? `✓ ${MARK_UNDO[lang]}` : MARK_DONE[lang]}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded steps + tips */}
            {!isDone && (
              <>
                <div style={{ height: 1, background: 'var(--border)' }} />
                <div style={{ padding: '14px 18px 16px 78px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {step.items[lang].map((item, j) =>
                      !item.label ? (
                        <div key={j} style={{
                          background: 'rgba(0,0,0,0.04)', borderRadius: 7,
                          padding: '5px 11px', borderLeft: '2px solid rgba(13,148,136,0.25)',
                        }}>
                          <p style={{ fontFamily: 'monospace', fontSize: '0.69rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{item.detail}</p>
                        </div>
                      ) : (
                        <div key={j}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: 6,
                              background: 'rgba(13,148,136,0.1)', color: 'var(--accent)',
                              fontSize: '0.62rem', fontWeight: 800,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, marginTop: 1,
                            }}>
                              {j + 1}
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{item.label}</p>
                          </div>
                          {item.detail && (
                            <div style={{ marginLeft: 28, marginTop: 4, background: 'rgba(0,0,0,0.04)', borderRadius: 7, padding: '5px 11px', borderLeft: '2px solid rgba(13,148,136,0.25)' }}>
                              <p style={{ fontFamily: 'monospace', fontSize: '0.69rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{item.detail}</p>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Tips */}
                  {step.tips && (
                    <div style={{ marginTop: 12, background: 'rgba(0,0,0,0.03)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Lightbulb size={13} style={{ color: 'var(--accent)' }} />
                        <p style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text)' }}>{TIPS_LABEL[lang]}</p>
                      </div>
                      {step.tips[lang].map((tip, j) => (
                        <div key={j} style={{ display: 'flex', gap: 7, marginBottom: j < step.tips![lang].length - 1 ? 5 : 0, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>{j + 1}.</span>
                          <p style={{ fontSize: '0.73rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{tip}</p>
                        </div>
                      ))}
                      {step.wikiUrl && (
                        <button
                          onClick={() => window.electron.openExternal(step.wikiUrl!)}
                          className="btn-ghost"
                          style={{ marginTop: 8, padding: '4px 0', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent)' }}
                        >
                          <BookOpen size={12} />{WIKI_LABEL[lang]}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Disclaimer */}
      {completedCount < total && (
        <div style={{ padding: '10px 14px', background: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 10 }}>
          <p style={{ fontSize: '0.72rem', lineHeight: 1.55, color: 'var(--text-3)' }}>{DISCLAIMER[lang]}</p>
        </div>
      )}

      {/* Celebration */}
      {completedCount === total && (
        <div className="card" style={{
          padding: '28px 24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(13,148,136,0.07) 0%, rgba(20,184,166,0.03) 100%)',
          border: '1px solid rgba(13,148,136,0.22)',
          animation: 'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative', overflow: 'hidden',
        }}>
          {(['✨','🎊','✨','🎉','✨','🎊'] as const).map((emoji, idx) => (
            <span key={idx} aria-hidden style={{
              position: 'absolute', fontSize: 16 + (idx % 3) * 4,
              animation: `floatUp ${1.4 + idx * 0.35}s ease-out ${idx * 0.25}s infinite`,
              left: `${8 + idx * 14}%`, bottom: '6%', pointerEvents: 'none', userSelect: 'none',
            }}>{emoji}</span>
          ))}
          <div style={{ fontSize: '2.2rem', marginBottom: 8, position: 'relative' }}>🎉</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 4 }}>
            {lang === 'ca' ? 'Tot llest!' : lang === 'es' ? '¡Todo listo!' : "You're all set!"}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
            {lang === 'ca' ? 'Gecko ja està completament configurat i llest per usar.' :
             lang === 'es' ? 'Gecko ya está completamente configurado y listo para usar.' :
             'Gecko is fully configured and ready to use.'}
          </p>
          <button
            onClick={() => window.electron.openExternal('http://localhost:5055')}
            className="btn-primary"
            style={{ animation: 'celebGlow 2s ease-in-out infinite', minWidth: 'unset', padding: '12px 28px', fontSize: '0.95rem', position: 'relative' }}
          >
            {lang === 'ca' ? 'Comença a demanar contingut!' :
             lang === 'es' ? '¡Empieza a pedir contenido!' :
             'Start requesting content!'}
          </button>
        </div>
      )}

    </div>
  );
}