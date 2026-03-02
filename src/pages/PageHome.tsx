import { useState, useEffect } from 'react';
import { useT } from '../LangContext';

const SERVICES = [
  { name: 'Jellyfin',    icon: '🎬', port: 8096, sub: (t: { done_cinema: string }) => t.done_cinema },
  { name: 'Jellyseerr',  icon: '🔍', port: 5055, sub: (t: { done_request: string }) => t.done_request },
  { name: 'Radarr',      icon: '🎥', port: 7878, sub: (t: { done_movies: string }) => t.done_movies },
  { name: 'Sonarr',      icon: '📺', port: 8989, sub: (t: { done_series: string }) => t.done_series },
  { name: 'Prowlarr',    icon: '🔌', port: 9696, sub: () => 'Indexers' },
  { name: 'qBittorrent', icon: '⬇️', port: 8090, sub: () => 'Downloads' },
];

type Status = 'checking' | 'running' | 'stopped';
type Action = 'idle' | 'starting' | 'stopping';

export default function PageHome({ config }: { config: Record<string, string> }) {
  const { t } = useT();
  const [status, setStatus] = useState<Status>('checking');
  const [action, setAction] = useState<Action>('idle');

  const checkStatus = async () => {
    const s = await window.electron.getStatus();
    setStatus(s === 'running' ? 'running' : 'stopped');
  };

  useEffect(() => { checkStatus(); }, []);

  const handleStart = async () => {
    setAction('starting');
    try { await window.electron.startStack(); await checkStatus(); }
    finally { setAction('idle'); }
  };

  const handleStop = async () => {
    setAction('stopping');
    try { await window.electron.stopStack(); await checkStatus(); }
    finally { setAction('idle'); }
  };

  const open = (port: number) => window.electron.openExternal(`http://localhost:${port}`);

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Status bar */}
      <div className="card-sm flex items-center justify-between px-4 py-3">
        <span className={`badge ${status}`}>
          {status === 'running' ? t.home_running : status === 'stopped' ? t.home_stopped : t.home_checking}
        </span>
        <div className="flex items-center gap-2">
          {status !== 'running' && (
            <button
              onClick={handleStart}
              disabled={action !== 'idle'}
              className="btn-primary"
              style={{ padding: '7px 18px', minWidth: 'unset', fontSize: '0.82rem' }}
            >
              {action === 'starting' ? t.home_starting : t.home_start}
            </button>
          )}
          {status === 'running' && (
            <button
              onClick={handleStop}
              disabled={action !== 'idle'}
              className="btn-secondary"
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
            >
              {action === 'stopping' ? t.home_stopping : t.home_stop}
            </button>
          )}
          <button onClick={checkStatus} className="btn-ghost" style={{ padding: '7px 10px' }} title="Refresh">↻</button>
        </div>
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {SERVICES.map(s => (
          <button
            key={s.name}
            onClick={() => open(s.port)}
            disabled={status !== 'running'}
            className="card-sm flex flex-col items-center gap-1.5 p-3 transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-xl">{s.icon}</span>
            <span className="font-semibold text-xs">{s.name}</span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>{s.sub(t as never)}</span>
          </button>
        ))}
      </div>

      {config.DATA_PATH && (
        <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>📁 {config.DATA_PATH}</p>
      )}
    </div>
  );
}
