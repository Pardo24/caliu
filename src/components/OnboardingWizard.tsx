import { useState, useEffect } from 'react';
import { Power, Monitor, ListChecks, ChevronRight, ChevronLeft, Sparkles, X, RefreshCw, ExternalLink } from 'lucide-react';
import { useT } from '../LangContext';

const ONBOARDED_KEY = 'moss_onboarded';

type SvcStatus = 'checking' | 'running' | 'stopped';

type Props = {
  onClose: () => void;
  onGoToGuide: () => void;
};

const STEPS = 4;

export default function OnboardingWizard({ onClose, onGoToGuide }: Props) {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [svcStatus, setSvcStatus] = useState<SvcStatus>('stopped');
  const [starting, setStarting] = useState(false);

  // When entering step 1 (Start services), check current status
  useEffect(() => {
    if (step === 1) {
      setSvcStatus('checking');
      window.electron.getStatus().then(s => setSvcStatus(s === 'running' ? 'running' : 'stopped'));
    }
  }, [step]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await window.electron.startStack();
      const s = await window.electron.getStatus();
      setSvcStatus(s === 'running' ? 'running' : 'stopped');
    } finally {
      setStarting(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    onClose();
  };

  const finish = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    onGoToGuide();
    onClose();
  };

  // Step 1 (index 1) requires services running to proceed
  const canNext = step === 1 ? svcStatus === 'running' : true;
  const isLast = step === STEPS - 1;

  const meta = [
    { icon: <Sparkles size={32} />, color: '#22c55e',      title: t.wizard_step1_title, body: t.wizard_step1_body },
    { icon: <Power   size={32} />, color: 'var(--accent)', title: t.wizard_step2_title, body: t.wizard_step2_body },
    { icon: <Monitor size={32} />, color: '#6366f1',       title: t.wizard_step3_title, body: t.wizard_step3_body },
    { icon: <ListChecks size={32} />, color: 'var(--accent)', title: t.wizard_step4_title, body: t.wizard_step4_body },
  ][step];

  // Interactive slot below description text
  let stepExtra: React.ReactNode = null;

  if (step === 1) {
    if (svcStatus === 'checking') {
      stepExtra = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: '0.82rem' }}>
          <RefreshCw size={13} className="spin" /> ...
        </div>
      );
    } else if (svcStatus === 'running') {
      stepExtra = (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', background: '#dcfce7', borderRadius: 99, color: '#15803d', fontSize: '0.82rem', fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          {t.home_running}
        </div>
      );
    } else {
      stepExtra = (
        <button
          onClick={handleStart}
          disabled={starting}
          className="btn-primary"
          style={{ padding: '10px 30px', minWidth: 'unset', fontSize: '0.88rem', gap: 7, display: 'inline-flex', alignItems: 'center' }}
        >
          {starting
            ? <><RefreshCw size={13} className="spin" />{t.home_starting}</>
            : <><Power size={13} />{t.home_start}</>}
        </button>
      );
    }
  }

  if (step === 2) {
    stepExtra = (
      <button
        onClick={() => window.electron.openExternal('http://localhost:8096')}
        className="btn-secondary"
        style={{ padding: '8px 22px', gap: 7, display: 'inline-flex', alignItems: 'center', fontSize: '0.85rem' }}
      >
        <ExternalLink size={13} />
        Jellyfin
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="card"
        style={{
          width: 340, padding: '32px 28px 24px',
          display: 'flex', flexDirection: 'column', gap: 20,
          position: 'relative', animation: 'slideUp 0.22s ease',
        }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <X size={14} />
        </button>

        {/* Step icon */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: `${meta.color}18`,
            border: `1.5px solid ${meta.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: meta.color, transition: 'all 0.2s',
          }}>
            {meta.icon}
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
            {meta.title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
            {meta.body}
          </p>
        </div>

        {/* Interactive area */}
        {stepExtra && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {stepExtra}
          </div>
        )}

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              style={{
                width: i === step ? 18 : 6, height: 6,
                borderRadius: 99, border: 'none', padding: 0,
                cursor: i < step ? 'pointer' : 'default',
                background: i === step ? 'var(--accent)' : i < step ? `var(--accent)60` : 'var(--border)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-secondary"
              style={{ padding: '9px 14px', minWidth: 'unset' }}
            >
              <ChevronLeft size={14} />
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="btn-ghost"
              style={{ padding: '9px 14px', fontSize: '0.82rem' }}
            >
              {t.wizard_skip}
            </button>
          )}

          {isLast ? (
            <button
              onClick={finish}
              className="btn-primary"
              style={{ flex: 1, padding: '10px 20px', minWidth: 'unset', fontSize: '0.88rem' }}
            >
              {t.wizard_go_guide}
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              className="btn-primary"
              style={{ flex: 1, padding: '10px 20px', minWidth: 'unset', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {t.wizard_next}
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Hint when next is disabled */}
        {step === 1 && !canNext && !starting && svcStatus === 'stopped' && (
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: -10 }}>
            {t.wizard_start_hint}
          </p>
        )}
      </div>
    </div>
  );
}
