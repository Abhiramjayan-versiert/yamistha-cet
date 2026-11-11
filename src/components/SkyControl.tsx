import { SKY_MODES, type SkyApi } from '../hooks/useSky';

const LABELS: Record<string, string> = { auto: 'Your time', dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night' };

/* Lets a visitor hold the sky at one time of day, or follow their own clock. */
export function SkyControl({ sky }: { sky: SkyApi }) {
  return (
    <div className="sky-control" role="group" aria-label="Time of day in the painting">
      <p className="footer__label">Sky</p>
      <div className="sky-control__options">
        {SKY_MODES.map((m) => (
          <button key={m} type="button" className={sky.mode === m ? 'is-active' : ''} aria-pressed={sky.mode === m} onClick={() => sky.setMode(m)}>
            {LABELS[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
