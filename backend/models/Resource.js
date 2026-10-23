const mongoose = require("mongoose");

const LEVELS = ["Primary", "Secondary", "University"];

const capitalise = (v) =>
  typeof v === "string" && v.trim()
    ? v.trim().charAt(0).toUpperCase() + v.trim().slice(1).toLowerCase()
    : v;

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required."], trim: true, minlength: [3, "Title must be at least 3 characters."], maxlength: [120, "Title must be at most 120 characters."] },
    subject: { type: String, required: [true, "Subject is required."], trim: true, minlength: 2, maxlength: 60 },
    description: { type: String, required: [true, "Description is required."], trim: true, maxlength: [500, "Description must be at most 500 characters."] },
    url: { type: String, required: [true, "URL is required."], trim: true, match: [/^https?:\/\/\S+$/, "URL must start with http:// or https://"] },
    level: { type: String, default: "Secondary", set: capitalise, enum: { values: LEVELS, message: "Level must be Primary, Secondary or University." } },
    language: { type: String, default: "English", trim: true, maxlength: 30 },
    helpfulCount: { type: Number, default: 0, min: 0 },
    flags: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      // The frontend expects `id`, not Mongo's `_id`, and must not see internals.
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.flags;
        return ret;
      },
    },
  }
);

// Indexes for the filters and the default sort.
resourceSchema.index({ subject: 1, level: 1 });
resourceSchema.index({ helpfulCount: -1 });

module.exports = mongoose.model("Resource", resourceSchema);
module.exports.LEVELS = LEVELS;
