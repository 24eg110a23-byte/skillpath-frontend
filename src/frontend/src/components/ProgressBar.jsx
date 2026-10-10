export default function ProgressBar({ value, done }) {
  return (
    <div
      className={`bar ${done ? "is-done" : ""}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
