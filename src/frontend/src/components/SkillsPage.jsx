import { useState } from "react";
import { api } from "../api";
import { LEVELS, levelLabel, skillToRequest } from "../constants";
import Dialog from "./Dialog";
import LevelMeter from "./LevelMeter";
import { Empty } from "./Overview";

const BLANK = { name: "", category: "", description: "", currentLevel: "BEGINNER", targetLevel: "ADVANCED" };

export default function SkillsPage({ skills, onChange, onError }) {
  const [editing, setEditing] = useState(null); // null = closed, {} = new, skill = edit

  async function setLevel(skill, level) {
    try {
      await api.skills.update(skill.id, { ...skillToRequest(skill), currentLevel: level });
      onChange();
    } catch (e) {
      onError(e.message);
    }
  }

  async function remove(skill) {
    const note = skill.courseCount > 0 ? ` It is linked to ${skill.courseCount} course(s).` : "";
    if (!window.confirm(`Delete ${skill.name}?${note}`)) return;
    try {
      await api.skills.remove(skill.id);
      onChange();
    } catch (e) {
      onError(e.message);
    }
  }

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h1>Skills</h1>
          <p className="muted">Click a step to update your level. The outlined step is your target.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing({})}>
          Add skill
        </button>
      </div>

      {skills.length === 0 ? (
        <Empty text="No skills yet. Add the first skill you want to build." action="Add skill" onClick={() => setEditing({})} />
      ) : (
        <ul className="list">
          {skills.map((s) => (
            <li key={s.id} className="row row-skill">
              <div className="row-main">
                <strong>{s.name}</strong>
                <span className="muted">
                  {[s.category, `${s.courseCount ?? 0} course(s)`, `${s.progressPercent ?? 0}% to target`].filter(Boolean).join(", ")}
                </span>
                {s.description && <span className="desc">{s.description}</span>}
              </div>
              <div className="row-side">
                <div className="level-readout">
                  <LevelMeter level={s.currentLevel} target={s.targetLevel} onChange={(lvl) => setLevel(s, lvl)} />
                  <span className="muted">
                    {s.currentLevelLabel || levelLabel(s.currentLevel)}, aiming for {s.targetLevelLabel || levelLabel(s.targetLevel)}
                  </span>
                </div>
                <div className="actions">
                  <button className="btn-ghost" onClick={() => setEditing(s)}>
                    Edit
                  </button>
                  <button className="btn-ghost danger" onClick={() => remove(s)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} title={editing?.id ? "Edit skill" : "Add skill"} onClose={() => setEditing(null)}>
        {editing !== null && (
          <SkillForm
            initial={editing.id ? editing : BLANK}
            id={editing.id}
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

function SkillForm({ initial, id, onDone }) {
  const [form, setForm] = useState({ ...initial, category: initial.category ?? "", description: initial.description ?? "" });
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
      name: form.name,
      category: form.category,
      description: form.description,
      currentLevel: form.currentLevel,
      targetLevel: form.targetLevel,
    };
    try {
      await (id ? api.skills.update(id, body) : api.skills.create(body));
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
      <Field label="Name" error={fieldErrors.name}>
        <input value={form.name} onChange={set("name")} required maxLength={100} autoFocus />
      </Field>
      <Field label="Category" error={fieldErrors.category}>
        <input value={form.category} onChange={set("category")} maxLength={60} placeholder="Backend, Design, Data" />
      </Field>
      <div className="form-pair">
        <Field label="Current level">
          <select value={form.currentLevel} onChange={set("currentLevel")}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {levelLabel(l)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Target level">
          <select value={form.targetLevel} onChange={set("targetLevel")}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {levelLabel(l)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Notes" error={fieldErrors.description}>
        <textarea rows={3} value={form.description} onChange={set("description")} maxLength={500} />
      </Field>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving" : "Save skill"}
      </button>
    </form>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="error">{error}</small>}
    </label>
  );
}
