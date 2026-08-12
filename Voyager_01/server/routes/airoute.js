const express = require("express");
const { authMiddleware } = require("../middleware/AuthMiddleware");
const {
  aiImageAnalyser,
  chatWithAI,
  getAIPredictions,
  getPredictionHistory,
  getDestinations,
  clearPredictionHistory
} = require("../controller/aiControllers");

const aiRouter = express.Router();

// Route to fetch available destinations
aiRouter.get("/destinations", getDestinations);

// Route for chat assistant (Copilot) - protected by auth
aiRouter.post("/chat", authMiddleware, chatWithAI);

// Route for custom ML model predictions - protected by auth
aiRouter.post("/predictions", authMiddleware, getAIPredictions);

// Route for prediction history - protected by auth
aiRouter.get("/history", authMiddleware, getPredictionHistory);
aiRouter.delete("/history", authMiddleware, clearPredictionHistory);

// Route for Gemini-based image analyzer - protected by auth
aiRouter.post("/aiImageAnalyser", authMiddleware, aiImageAnalyser);

module.exports = aiRouter;
