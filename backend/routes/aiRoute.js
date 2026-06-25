const express = require('express');
const aiSummary = require('../services/ai-sprint');
const router = express.Router();


// routes/ai.js
router.post("/summary", async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const result = await aiSummary(prompt);
    res.json({ success: true, summary: result.response });
  } catch (err) {
    next(err);
  }
});

module.exports = router;