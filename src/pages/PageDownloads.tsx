import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, X, AlertCircle } from 'lucide-react';
import { useT } from '../LangContext';
import ServiceIcon from '../components/ServiceIcon';

type Props = { config: Record<string, string> };

type QueueItem = {
  id: number;
  service: 'radarr' | 'sonarr';
  title: string;
  quality: string;
  status: string;
  progress: number;       // 0–100
  timeLeft: string;
  size: number;
  sizeLeft: number;
};

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

async function fetchQueue(
  port: number, apiKey: string, service: 'radarr' | 'sonarr',
): Promise<QueueItem[]> {
  const url = `http://localhost:${port}/api/v3/queue?page=1&pageSize=50&sortKey=progress&sortDirection=descending`;
  const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
  if (!res.ok) return [];
  const data = await res.json() as { records: Record<string, unknown>[] };
  return (data.records ?? []).map(r => {
    const movie = r.movie as { title?: string; year?: number } | undefined;
    const series = r.series as { title?: string } | undefined;
    const episode = r.episode as { seasonNumber?: number; episodeNumber?: number } | undefined;
    const quality = (r.quality as { quality?: { name?: string } })?.quality?.name ?? '';
    const size = Number(r.size ?? 0);
    const sizeLeft = Number(r.sizeleft ?? 0);
    const progress = size > 0 ? Math.round(((size - sizeLeft) / size) * 100) : 0;

    let title = String(r.title ?? '');
    if (service === 'radarr' && movie?.title) {
      title = movie.year ? `${movie.title} (${movie.year})` : movie.title;
    } else if (service === 'sonarr' && series?.title) {
      const ep = episode ? ` S${String(episode.seasonNumber ?? 0).padStart(2, '0')}E${String(episode.episodeNumber ?? 0).padStart(2, '0')}` : '';
      title = `${series.title}${ep}`;
    }

    return {
      id: Number(r.id),
      service,
      title,
      quality,
      status: String(r.status ?? ''),
      progress,
      timeLeft: String(r.timeleft ?? ''),
      size,
      sizeLeft,
    };
  });
}

async function blocklistItem(port: number, apiKey: string, id: number): Promise<void> {
  await fetch(
    `http://localhost:${port}/api/v3/queue/${id}?blocklist=true&removeFromClient=true`,
    { method: 'DELETE', headers: { 'X-Api-Key': apiKey } },
  );
}

export default function PageDownloads({ config }: Props) {
  const { t } = useT();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blocking, setBlocking] = useState<number | null>(null);

  const radarrPort = Number(config.RADARR_PORT ?? 7878);
  const sonarrPort = Number(config.SONARR_PORT ?? 8989);
  const radarrKey  = config.RADARR_API_KEY ?? '';
  const sonarrKey  = config.SONARR_API_KEY ?? '';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [radarr, sonarr] = await Promise.all([
        radarrKey ? fetchQueue(radarrPort, radarrKey, 'radarr') : [],
        sonarrKey ? fetchQueue(sonarrPort, sonarrKey, 'sonarr') : [],
      ]);
      setItems([...radarr, ...sonarr].sort((a, b) => b.progress - a.progress));
    } catch {
      setError(t.dl_error);
    } finally {
      setLoading(false);
    }
  }, [radarrKey, sonarrKey, radarrPort, sonarrPort]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 10 s
  useEffect(() => {
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  const handleBlocklist = async (item: QueueItem) => {
    setBlocking(item.id);
    const port = item.service === 'radarr' ? radarrPort : sonarrPort;
    const key  = item.service === 'radarr' ? radarrKey  : sonarrKey;
    try {
      await blocklistItem(port, key, item.id);
      setItems(prev => prev.filter(i => i.id !== item.id || i.service !== item.service));
    } catch { /* ignore */ }
    setBlocking(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 10px', flexShrink: 0, borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{t.dl_title}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 1 }}>{t.dl_subtitle}</p>
        </div>
        <button
          onClick={load}
          className="btn-ghost"
          style={{ padding: '6px', borderRadius: 8, display: 'flex' }}
          title={t.dl_refresh}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 }}>
            <p style={{ fontSize: '2rem' }}>✅</p>
            <p style={{ fontWeight: 600, color: 'var(--text)' }}>{t.dl_empty}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{t.dl_empty_sub}</p>
          </div>
        )}

        {items.map(item => {
          const isBlocking = blocking === item.id;
          return (
            <div key={`${item.service}-${item.id}`} className="card-sm" style={{ padding: '12px 14px' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <ServiceIcon name={item.service === 'radarr' ? 'Radarr' : 'Sonarr'} size={16} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                    {item.quality && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'rgba(0,0,0,0.06)', color: 'var(--text-3)' }}>
                        {item.quality}
                      </span>
                    )}
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>
                      {formatBytes(item.size - item.sizeLeft)} / {formatBytes(item.size)}
                    </span>
                    {item.timeLeft && item.timeLeft !== '00:00:00' && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>
                        ~{item.timeLeft.split('.')[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Blocklist button */}
                <button
                  onClick={() => handleBlocklist(item)}
                  disabled={isBlocking}
                  title={t.dl_blocklist_tip}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 9px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600,
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: isBlocking ? 'rgba(239,68,68,0.05)' : 'transparent',
                    color: '#ef4444', cursor: isBlocking ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                >
                  <X size={11} />{isBlocking ? '...' : t.dl_blocklist}
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${item.progress}%`,
                    background: item.progress === 100 ? '#22c55e' : 'var(--accent)',
                    transition: 'width 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', flexShrink: 0, fontFamily: 'monospace' }}>
                  {item.progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      {items.length > 0 && (
        <div style={{ padding: '8px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{t.dl_blocklist_note}</p>
        </div>
      )}
    </div>
  );
}