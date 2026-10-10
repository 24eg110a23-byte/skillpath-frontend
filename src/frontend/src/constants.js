// Skill levels, lowest to highest. Edit this list if your SkillLevel enum differs.
export const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

const LEVEL_LABELS = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

// 1-based position of a level (0 when unknown)
export const levelIndex = (level) => LEVELS.indexOf(level) + 1;
export const levelLabel = (level) => LEVEL_LABELS[level] || level || "";

export const STATUS_LABELS = {
  PLANNED: "Planned",
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

// Converts a skill from the API into the body the API accepts back.
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
