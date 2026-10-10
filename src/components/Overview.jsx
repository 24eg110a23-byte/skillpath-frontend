import { LEVELS } from "../constants";
import LevelMeter from "./LevelMeter";
import ProgressBar from "./ProgressBar";

export default function Overview({ skills, courses, stats, onNavigate }) {
  const gaps = skills
    .filter((s) => s.currentLevel < s.targetLevel)
    .sort((a, b) => a.targetLevel - a.currentLevel - (b.targetLevel - b.currentLevel))
    .slice(0, 5);
  const active = courses.filter((c) => c.status === "IN_PROGRESS");

  return (
    <div className="stack-lg">
      <section className="figures" aria-label="Summary">
        <Figure value={`${stats?.skillsAtTarget ?? 0} of ${stats?.totalSkills ?? 0}`} label="skills at target level" />
        <Figure value={stats?.inProgressCourses ?? 0} label="courses in progress" />
        <Figure value={stats?.completedCourses ?? 0} label="courses completed" />
        <Figure value={`${stats?.hoursLearned ?? 0} h`} label="learned so far" />
      </section>

      <div className="two-col">
        <section className="stack">
          <h2>Closest to target</h2>
          {gaps.length === 0 ? (
            <Empty
              text={skills.length === 0 ? "No skills yet. Add the first skill you want to build." : "Every skill has reached its target. Raise a target to keep growing."}
              action="Go to skills"
              onClick={() => onNavigate("skills")}
            />
          ) : (
            <ul className="list">
              {gaps.map((s) => (
                <li key={s.id} className="row">
                  <div className="row-main">
                    <strong>{s.name}</strong>
                    <span className="muted">
                      {LEVELS[s.currentLevel]} to {LEVELS[s.targetLevel]}
                    </span>
                  </div>
                  <LevelMeter level={s.currentLevel} target={s.targetLevel} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="stack">
          <h2>Courses in progress</h2>
          {active.length === 0 ? (
            <Empty text="Nothing in progress. Start a planned course or add a new one." action="Go to courses" onClick={() => onNavigate("courses")} />
          ) : (
            <ul className="list">
              {active.map((c) => (
                <li key={c.id} className="row row-col">
                  <div className="row-main">
                    <strong>{c.title}</strong>
                    <span className="muted">{c.skillName || c.provider || "No skill linked"}</span>
                  </div>
                  <div className="row-progress">
                    <ProgressBar value={c.progress} />
                    <span className="muted">{c.progress}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Figure({ value, label }) {
  return (
    <div className="figure">
      <span className="figure-value">{value}</span>
      <span className="muted">{label}</span>
    </div>
  );
}

export function Empty({ text, action, onClick }) {
  return (
    <div className="empty">
      <p>{text}</p>
      {action && (
        <button type="button" className="btn-secondary" onClick={onClick}>
          {action}
        </button>
      )}
    </div>
  );
}
