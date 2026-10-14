export const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const API_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export const STATUS_LABELS = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

// Converts a skill or course from the API into the shape the API accepts back.
export const skillToRequest = (s) => ({
  name: s.name,
  category: s.category,
  description: s.description,
  currentLevel: typeof s.currentLevel === "number" ? API_LEVELS[s.currentLevel] : s.currentLevel,
  targetLevel: typeof s.targetLevel === "number" ? API_LEVELS[s.targetLevel] : s.targetLevel,
});

export const courseToRequest = (c) => ({
  title: c.title,
  provider: c.provider.trim(),
  url: c.url,
  status: c.status,
  totalHours: Number(c.hoursTotal) || 0,
  completedHours:
    c.status === "COMPLETED"
      ? Number(c.hoursTotal) || 0
      : c.status === "NOT_STARTED"
        ? 0
        : Math.round(((Number(c.hoursTotal) || 0) * (Number(c.progress) || 0)) / 100),
  startedOn: c.startedOn,
  targetCompletionDate: c.targetCompletionDate || null,
  description: c.notes,
});
