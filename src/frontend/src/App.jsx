import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import CoursesPage from "./components/CoursesPage";
import Overview from "./components/Overview";
import SkillsPage from "./components/SkillsPage";

const TABS = [
  ["overview", "Overview"],
  ["skills", "Skills"],
  ["courses", "Courses"],
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [skills, setSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // Load both lists independently so one failing endpoint does not blank the page.
    const [s, c] = await Promise.allSettled([api.skills.list(), api.courses.list()]);
    const failed = [];
    if (s.status === "fulfilled") setSkills(s.value);
    else failed.push("skills");
    if (c.status === "fulfilled") setCourses(c.value);
    else failed.push("courses");
    setError(failed.length ? `Could not load ${failed.join(" and ")}. Check that the backend is running on port 8080.` : "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Overview numbers are computed here, so no stats endpoint is needed.
  const stats = useMemo(() => {
    const atTarget = skills.filter((s) => s.status === "ACHIEVED").length;
    const avg = skills.length ? Math.round(skills.reduce((sum, s) => sum + (s.progressPercent ?? 0), 0) / skills.length) : 0;
    return {
      totalSkills: skills.length,
      skillsAtTarget: atTarget,
      averageProgress: avg,
      inProgressCourses: courses.filter((c) => c.status === "IN_PROGRESS").length,
      completedCourses: courses.filter((c) => c.status === "COMPLETED").length,
    };
  }, [skills, courses]);

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">Skillpath</span>
        <nav aria-label="Main">
          {TABS.map(([id, label]) => (
            <button key={id} className="tab" aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {error && (
          <div className="banner" role="alert">
            <span>{error}</span>
            <button className="btn-ghost" onClick={load}>
              Try again
            </button>
          </div>
        )}
        {loading ? (
          <p className="muted">Loading</p>
        ) : tab === "overview" ? (
          <Overview skills={skills} courses={courses} stats={stats} onNavigate={setTab} />
        ) : tab === "skills" ? (
          <SkillsPage skills={skills} onChange={load} onError={setError} />
        ) : (
          <CoursesPage courses={courses} skills={skills} onChange={load} onError={setError} />
        )}
      </main>
    </div>
  );
}
