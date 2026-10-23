
const express = require("express");
const router = express.Router();

const {
  getResources,
  addResource,
  markResourceHelpful
} = require("../controllers/resourceController");

router.get("/", getResources);
router.post("/", addResource);
router.post("/:id/helpful", markResourceHelpful);

module.exports = router;
