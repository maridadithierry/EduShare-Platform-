const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const resources = [
  {
    id: 1,
    title: "KCSE Mathematics Revision Pack",
    description: "Short exercises and worked examples for Form 4 students.",
    subject: "Mathematics",
    level: "Secondary",
    language: "English",
    helpfulCount: 9,
  },
  {
    id: 2,
    title: "Primary Science Quiz Sheets",
    description: "Printable quiz sheets for classes preparing for local exams.",
    subject: "Science",
    level: "Primary",
    language: "English",
    helpfulCount: 6,
  },
  {
    id: 3,
    title: "Digital Skills Starter Guide",
    description: "Beginner notes for internet safety and basic computer use.",
    subject: "ICT",
    level: "Secondary",
    language: "English",
    helpfulCount: 5,
  },
  {
    id: 4,
    title: "Academic Writing Basics",
    description: "Sentence structure and essay planning for first-year students.",
    subject: "English",
    level: "University",
    language: "English",
    helpfulCount: 4,
  },
  {
    id: 5,
    title: "Bridge Algebra Notes",
    description: "Core algebra reminders for upper-primary transition learners.",
    subject: "Mathematics",
    level: "Primary",
    language: "English",
    helpfulCount: 7,
  },
];

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/resources", (req, res) => {
  const subject = req.query.subject;
  const level = req.query.level;

  const filtered = resources
    .filter((resource) => {
      if (subject && resource.subject !== subject) {
        return false;
      }

      if (level && resource.level !== level) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.helpfulCount - a.helpfulCount);

  res.json({ resources: filtered });
});

app.post("/api/resources/:id/helpful", (req, res) => {
  const resourceId = Number(req.params.id);
  const target = resources.find((resource) => resource.id === resourceId);

  if (!target) {
    return res.status(404).json({ message: "Resource not found" });
  }

  target.helpfulCount += 1;
  return res.json({ resource: target });
});

app.listen(PORT, () => {
  console.log(`EduShare API running on http://localhost:${PORT}`);
});
