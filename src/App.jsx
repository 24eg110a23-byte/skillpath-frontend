import { useCallback, useEffect, useState } from "react";
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
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, c, st] = await Promise.all([api.skills.list(), api.courses.list(), api.stats()]);
      setSkills(s);
      setCourses(c);
      setStats(st);
      setError("");
    } catch (e) {
      setError("Could not reach the server. Check that the backend is running on port 8080.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
