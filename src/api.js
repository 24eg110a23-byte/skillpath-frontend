import { courseToRequest, skillToRequest } from "./constants";

const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      /* response had no JSON body */
    }
    const error = new Error(body?.message || `Request failed (${res.status})`);
    error.fieldErrors = body?.errors || {};
    throw error;
  }
  return res.status === 204 ? null : res.json();
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

const levelIndex = (level) => ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].indexOf(level);
const skillFromResponse = (skill) => ({
  ...skill,
  currentLevel: levelIndex(skill.currentLevel),
  targetLevel: levelIndex(skill.targetLevel),
});
const courseFromResponse = (course) => ({
  ...course,
  progress: course.progressPercent,
  hoursTotal: course.totalHours,
  notes: course.description ?? "",
  targetCompletionDate: course.targetCompletionDate ?? "",
  skillName: course.skillCount > 0 ? `${course.skillCount} linked skill${course.skillCount === 1 ? "" : "s"}` : "",
});

export const api = {
  stats: async () => {
    const dashboard = await request("/dashboard");
    return {
      skillsAtTarget: dashboard.skills.achieved,
      totalSkills: dashboard.skills.total,
      inProgressCourses: dashboard.courses.inProgress,
      completedCourses: dashboard.courses.completed,
      hoursLearned: dashboard.courses.completedHours,
    };
  },
  skills: {
    list: async () => (await request("/skills")).content.map(skillFromResponse),
    create: (data) => request("/skills", json("POST", skillToRequest(data))),
    update: (id, data) => request(`/skills/${id}`, json("PUT", skillToRequest(data))),
    remove: (id) => request(`/skills/${id}`, { method: "DELETE" }),
  },
  courses: {
    list: async () => (await request("/courses")).content.map(courseFromResponse),
    create: async (data) => {
      const course = await request("/courses", json("POST", courseToRequest(data)));
      if (data.skillId) {
        try {
          await request(`/skills/${data.skillId}/courses`, json("POST", { courseId: course.id }));
        } catch (error) {
          try {
            await request(`/courses/${course.id}`, { method: "DELETE" });
          } catch (cleanupError) {
            throw new Error(`${error.message} The course was created but could not be removed.`);
          }
          throw error;
        }
      }
      return courseFromResponse(course);
    },
    update: async (id, data) => {
      const course = await request(`/courses/${id}`, json("PUT", courseToRequest(data)));
      if (data.skillId) {
        const detail = await request(`/courses/${id}/detail`);
        if (!detail.skills.some((link) => link.skill.id === Number(data.skillId))) {
          await request(`/skills/${data.skillId}/courses`, json("POST", { courseId: course.id }));
        }
      }
      return courseFromResponse(course);
    },
    remove: (id) => request(`/courses/${id}`, { method: "DELETE" }),
  },
};
