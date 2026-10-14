import { useState } from "react";
import { api } from "../api";
import { STATUS_LABELS } from "../constants";
import Dialog from "./Dialog";
import { Empty } from "./Overview";
import ProgressBar from "./ProgressBar";
import { Field } from "./SkillsPage";

const BLANK = {
  title: "",
  provider: "",
  url: "",
  status: "NOT_STARTED",
  progress: 0,
  hoursTotal: "",
  startedOn: "",
  targetCompletionDate: "",
  notes: "",
  skillId: "",
};

const FILTERS = [["ALL", "All"], ...Object.entries(STATUS_LABELS)];

export default function CoursesPage({ courses, skills, onChange, onError }) {
  const [filter, setFilter] = useState("ALL");
  const [editing, setEditing] = useState(null);

  const visible = filter === "ALL" ? courses : courses.filter((c) => c.status === filter);

  async function markDone(course) {
    try {
      await api.courses.update(course.id, { ...course, status: "COMPLETED", progress: 100 });
      onChange();
    } catch (e) {
      onError(e.message);
    }
  }

  async function remove(course) {
    if (!window.confirm(`Delete ${course.title}?`)) return;
    try {
      await api.courses.remove(course.id);
      onChange();
    } catch (e) {
      onError(e.message);
    }
  }

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h1>Courses</h1>
          <p className="muted">Track what you are taking and which skill it builds.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing({})}>
          Add course
        </button>
      </div>

      <div className="chips" role="group" aria-label="Filter by status">
        {FILTERS.map(([value, label]) => (
          <button key={value} className="chip" aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {label}
            <span className="chip-count">{value === "ALL" ? courses.length : courses.filter((c) => c.status === value).length}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty
          text={courses.length === 0 ? "No courses yet. Add the first course you are taking or plan to take." : "No courses with this status."}
          action={courses.length === 0 ? "Add course" : undefined}
          onClick={() => setEditing({})}
        />
      ) : (
        <ul className="list">
          {visible.map((c) => (
            <li key={c.id} className="row row-course">
              <div className="row-main">
                <strong>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noreferrer">
                      {c.title}
                    </a>
                  ) : (
                    c.title
                  )}
                </strong>
                <span className="muted">
                  {[c.provider, c.skillName, c.hoursTotal ? `${c.hoursTotal} h` : null].filter(Boolean).join(", ") || "No details yet"}
                </span>
              </div>
              <div className="row-side">
                <div className="row-progress">
                  <span className={`status status-${c.status}`}>{STATUS_LABELS[c.status]}</span>
                  <ProgressBar value={c.progress} done={c.status === "COMPLETED"} />
                  <span className="muted">{c.progress}%</span>
                </div>
                <div className="actions">
                  {c.status !== "COMPLETED" && (
                    <button className="btn-ghost" onClick={() => markDone(c)}>
                      Mark complete
                    </button>
                  )}
                  <button className="btn-ghost" onClick={() => setEditing(c)}>
                    Edit
                  </button>
                  <button className="btn-ghost danger" onClick={() => remove(c)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} title={editing?.id ? "Edit course" : "Add course"} onClose={() => setEditing(null)}>
        {editing !== null && (
          <CourseForm
            skills={skills}
            id={editing.id}
            initial={editing.id ? editing : BLANK}
            onDone={() => {
              setEditing(null);
              onChange();
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function CourseForm({ initial, id, skills, onDone }) {
  const [form, setForm] = useState({
    ...initial,
    provider: initial.provider ?? "",
    url: initial.url ?? "",
    hoursTotal: initial.hoursTotal ?? "",
    startedOn: initial.startedOn ?? "",
    targetCompletionDate: initial.targetCompletionDate ?? "",
    notes: initial.notes ?? "",
    skillId: initial.skillId ?? "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    const body = {
      title: form.title,
      provider: form.provider,
      url: form.url,
      status: form.status,
      progress: Number(form.progress) || 0,
      hoursTotal: form.hoursTotal === "" ? null : Number(form.hoursTotal),
      startedOn: form.startedOn || null,
      targetCompletionDate: form.targetCompletionDate || null,
      notes: form.notes,
      skillId: form.skillId === "" ? null : Number(form.skillId),
    };
    try {
      await (id ? api.courses.update(id, body) : api.courses.create(body));
      onDone();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <Field label="Title" error={fieldErrors.title}>
        <input value={form.title} onChange={set("title")} required maxLength={160} autoFocus />
      </Field>
      <div className="form-pair">
        <Field label="Provider">
          <input value={form.provider} onChange={set("provider")} required maxLength={120} placeholder="Udemy, Coursera" />
        </Field>
        <Field label="Skill it builds">
          <select value={form.skillId} onChange={set("skillId")}>
            <option value="">None</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Course link" error={fieldErrors.url}>
        <input type="url" value={form.url} onChange={set("url")} maxLength={500} placeholder="https://" />
      </Field>
      <div className="form-pair">
        <Field label="Status">
          <select value={form.status} onChange={set("status")}>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Progress (%)" error={fieldErrors.progress}>
          <input type="number" min={0} max={100} value={form.progress} onChange={set("progress")} />
        </Field>
      </div>
      <div className="form-pair">
        <Field label="Total hours" error={fieldErrors.hoursTotal}>
          <input type="number" min={0} max={10000} value={form.hoursTotal} onChange={set("hoursTotal")} />
        </Field>
        <Field label="Started on">
          <input type="date" value={form.startedOn} onChange={set("startedOn")} />
        </Field>
        <Field label="Target completion date">
          <input type="date" value={form.targetCompletionDate} onChange={set("targetCompletionDate")} />
        </Field>
      </div>
      <Field label="Notes" error={fieldErrors.notes}>
        <textarea rows={3} value={form.notes} onChange={set("notes")} maxLength={1000} />
      </Field>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving" : "Save course"}
      </button>
    </form>
  );
}
