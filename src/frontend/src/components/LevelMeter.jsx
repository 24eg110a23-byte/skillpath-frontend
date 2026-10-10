import { LEVELS, levelIndex, levelLabel } from "../constants";

/**
 * One step per skill level. Filled steps show the current level; the outlined
 * step marks the target. Pass onChange to make the steps clickable.
 */
export default function LevelMeter({ level, target, onChange }) {
  const current = levelIndex(level);
  const goal = levelIndex(target);

  return (
    <div className="meter" role="group" aria-label={`Level ${levelLabel(level)}, target ${levelLabel(target)}`}>
      {LEVELS.map((key, i) => {
        const step = i + 1;
        const cls = ["meter-step", step <= current ? "is-filled" : "", step === goal ? "is-target" : ""].join(" ");
        return onChange ? (
          <button
            key={key}
            type="button"
            className={cls}
            title={`Set level to ${levelLabel(key)}`}
            aria-label={`Set level to ${levelLabel(key)}`}
            aria-pressed={step === current}
            onClick={() => step !== current && onChange(key)}
          />
        ) : (
          <span key={key} className={cls} />
        );
      })}
    </div>
  );
}
