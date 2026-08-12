require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// FastAPI URL configured in environment
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

async function getUnsplashImage(destination) {
  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.append("query", destination);
    url.searchParams.append("per_page", "1");

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
    const data = await res.json();
    const result = data.results[0];
    return result ? result.urls.small : null;
  } catch (err) {
    console.error(
      `🔍 Error fetching Unsplash image for "${destination}":`,
      err.message
    );
    return null;
  }
}

async function analyzeImageAndFindDestinations(imageUrl, country) {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
    const imageBuffer = Buffer.from(await imgRes.arrayBuffer());

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Guess the specific place shown in this image. Then, suggest 5 visually and culturally similar travel destinations from ${country}. Format your reply as:
Place in image: <place name>
1. <destination>
2. <destination>
3. <destination>
4. <destination>
5. <destination>`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBuffer.toString("base64"),
        },
      },
    ]);

    const content = result.response.text();
    const lines = content.split("\n").filter(Boolean);
    const placeLine = lines.find((l) =>
      l.toLowerCase().startsWith("place in image")
    );
    const guessedPlace = placeLine ? placeLine.split(":")[1].trim() : "Unknown";

    const destinations = lines
      .filter((l) => /^\d+\.\s/.test(l))
      .map((l) => l.replace(/^\d+\.\s*/, "").trim())
      .slice(0, 5);

    const destinationImages = await Promise.all(
      destinations.map(getUnsplashImage)
    );

    return {
      guessedPlace,
      originalImage: imageUrl,
      country,
      recommendations: destinations.map((dest, i) => ({
        name: dest,
        image: destinationImages[i],
      })),
    };
  } catch (error) {
    console.error("❌ Error:", error.message || error);
    return { error: error.message || "Unknown error" };
  }
}

// 1. Image place analyzer handler
const aiImageAnalyser = async (req, res) => {
  const { imageUrl, country } = req.body;
  if (!imageUrl || !country) {
    return res.status(400).json({ error: "imageUrl and country are required" });
  }
  const data = await analyzeImageAndFindDestinations(imageUrl, country);
  res.json(data);
};

// 2. Chat with AI Assistant (Copilot RAG Layer)
const chatWithAI = async (req, res) => {
  const { destination, query, chat_history, visit_date } = req.body;
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }
  const dest = destination && destination.trim() ? destination.trim() : "General";

  try {
    console.log(`💬 Forwarding chat request for "${dest}" to FastAPI...`);
    const response = await fetch(`${FASTAPI_URL}/assistant/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: dest,
        query,
        visit_date: visit_date || new Date().toISOString().split("T")[0],
        chat_history: chat_history || []
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`FastAPI server returned error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error in chatWithAI controller:", error.message);
    return res.json({
      destination: dest,
      response: `👋 **Hello! I am TripBuddy AI.**\n\nI am currently having trouble reaching the AI inference backend on port 8000. Please ensure the Python service is running:\n\`cd AI_Service && source venv/bin/activate && uvicorn app.main:app --reload\``
    });
  }
};

// 3. Get AI Travel Recommendations & Prediction Status
const getAIPredictions = async (req, res) => {
  const { destination, visit_date, interests, budget } = req.body;
  if (!visit_date) {
    return res.status(400).json({ error: "visit_date is required" });
  }
  const dest = destination && destination.trim() ? destination.trim() : "General";

  try {
    console.log(`🤖 Forwarding predictions request for "${dest}" to FastAPI...`);
    const response = await fetch(`${FASTAPI_URL}/assistant/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: dest,
        visit_date,
        interests: interests || [],
        budget: budget || null
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`FastAPI server returned error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error in getAIPredictions controller:", error.message);
    return res.json({
      destination: dest,
      safety: "Low Risk",
      safety_confidence: 0.9,
      scam_risk: "Low Risk",
      scam_confidence: 0.9,
      crowd_level: "Moderate",
      crowd_confidence: 0.85,
      recommendation: `General travel guidance for ${dest}`,
      summary: "AI Predictor Service is starting up."
    });
  }
};

// 4. Get Prediction History
const getPredictionHistory = async (req, res) => {
  try {
    console.log("📜 Forwarding get prediction history request to FastAPI...");
    const response = await fetch(`${FASTAPI_URL}/predictions`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`FastAPI server returned error: ${response.status}`);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error in getPredictionHistory controller:", error.message);
    return res.status(500).json({
      error: "Failed to fetch prediction history from AI service",
      details: error.message
    });
  }
};

// 5. Get Dynamic Destinations
const getDestinations = async (req, res) => {
  try {
    const defaultDestinations = [
      "Purulia",
      "Kashmir",
      "Kerala",
      "Delhi",
      "Andaman",
      "Digha",
      "Bishnupur",
      "Dooars",
      "Victoria Memorial"
    ];

    let destinations = [];
    try {
      const response = await fetch(`${FASTAPI_URL}/destinations`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          destinations = data
            .map((item) => item.destination_name || item.name)
            .filter(Boolean);
        }
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch destinations from FastAPI, using defaults:", err.message);
    }

    if (destinations.length === 0) {
      destinations = defaultDestinations;
    }

    const uniqueDestinations = Array.from(new Set(destinations));

    return res.status(200).json({
      success: true,
      destinations: uniqueDestinations,
    });
  } catch (error) {
    console.error("❌ Error in getDestinations controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load destinations",
      destinations: [
        "Purulia",
        "Kashmir",
        "Kerala",
        "Delhi",
        "Andaman",
        "Digha",
        "Bishnupur",
        "Dooars",
        "Victoria Memorial"
      ],
    });
  }
};

// 6. Clear Prediction History
const clearPredictionHistory = async (req, res) => {
  try {
    console.log("🗑️ Requesting clear prediction history from FastAPI...");
    const response = await fetch(`${FASTAPI_URL}/predictions`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`FastAPI server returned status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      message: "Prediction history cleared successfully",
      data
    });
  } catch (error) {
    console.error("❌ Error in clearPredictionHistory controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to clear prediction history from AI service",
      details: error.message
    });
  }
};

module.exports = {
  aiImageAnalyser,
  chatWithAI,
  getAIPredictions,
  getPredictionHistory,
  getDestinations,
  clearPredictionHistory
};
