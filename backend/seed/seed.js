// Seeds starter resources only when the collection is empty (safe to re-run).
// Manual run: npm run seed
const SEED = [
  { title: "KCSE Mathematics Revision Pack", description: "Short exercises and worked examples for Form 4 students.", subject: "Mathematics", level: "Secondary", language: "English", url: "https://example.org/kcse-maths", helpfulCount: 9 },
  { title: "Primary Science Quiz Sheets", description: "Printable quiz sheets for classes preparing for local exams.", subject: "Science", level: "Primary", language: "English", url: "https://example.org/primary-science", helpfulCount: 6 },
  { title: "Digital Skills Starter Guide", description: "Beginner notes for internet safety and basic computer use.", subject: "ICT", level: "Secondary", language: "English", url: "https://example.org/digital-skills", helpfulCount: 5 },
  { title: "Academic Writing Basics", description: "Sentence structure and essay planning for first-year students.", subject: "English", level: "University", language: "English", url: "https://example.org/academic-writing", helpfulCount: 4 },
  { title: "Bridge Algebra Notes", description: "Core algebra reminders for upper-primary transition learners.", subject: "Mathematics", level: "Primary", language: "English", url: "https://example.org/bridge-algebra", helpfulCount: 7 },
];

async function seedIfEmpty() {
  const Resource = require("../models/Resource");
  if ((await Resource.countDocuments()) > 0) return 0;
  await Resource.insertMany(SEED);
  return SEED.length;
}

module.exports = { seedIfEmpty, SEED };

if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  (async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const n = await seedIfEmpty();
    console.log(n ? `Seeded ${n} resources.` : "Collection not empty, nothing seeded.");
    await mongoose.disconnect();
  })().catch((e) => { console.error(e.message); process.exit(1); });
}
