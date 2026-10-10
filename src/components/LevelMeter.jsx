import { LEVELS } from "../constants";

/**
 * Five-step meter. Filled steps show the current level; the outlined step
 * marks the target. Pass onChange to make the steps clickable.
 */
export default function LevelMeter({ level, target, onChange }) {
  return (
    <div className="meter" role="group" aria-label={`Level ${LEVELS[level]}, target ${LEVELS[target]}`}>
      {[1, 2, 3, 4, 5].map((step) => {
        const cls = ["meter-step", step <= level ? "is-filled" : "", step === target ? "is-target" : ""].join(" ");
        return onChange ? (
          <button
            key={step}
            type="button"
            className={cls}
            title={`Set level to ${LEVELS[step]}`}
            aria-label={`Set level to ${LEVELS[step]}`}
            aria-pressed={step === level}
            onClick={() => onChange(step === level ? step - 1 : step)}
          />
        ) : (
          <span key={step} className={cls} />
        );
      })}
    </div>
  );
}
