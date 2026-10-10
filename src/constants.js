export const LEVELS = ["Not started", "Novice", "Beginner", "Working", "Advanced", "Expert"];

export const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

// Converts a skill or course from the API into the shape the API accepts back.
export const skillToRequest = (s) => ({
  name: s.name,
  category: s.category,
  description: s.description,
  currentLevel: s.currentLevel,
  targetLevel: s.targetLevel,
});

export const courseToRequest = (c) => ({
  title: c.title,
  provider: c.provider,
  url: c.url,
  status: c.status,
  progress: c.progress,
  hoursTotal: c.hoursTotal,
  startedOn: c.startedOn,
  completedOn: c.completedOn,
  notes: c.notes,
  skillId: c.skillId,
});
