import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import {
  FiSend,
  FiAlertTriangle,
  FiCompass,
  FiMapPin,
  FiUsers,
  FiShield,
  FiCalendar,
  FiTrendingUp,
  FiMessageSquare,
  FiActivity,
  FiCheckCircle,
  FiAlertOctagon,
  FiInfo,
  FiTrash2
} from "react-icons/fi";

import { renderFormattedMessage } from "../utils/aiFormatter";

const renderRiskBadge = (value, isFullWidth = false) => {
  if (!value) return null;
  
  let textVal = "";
  if (typeof value === "object") {
    textVal = value.risk || value.scam_risk || value.crowd_level || value.level || value.status || value.label || JSON.stringify(value);
  } else {
    textVal = String(value);
  }

  const str = textVal.toLowerCase();

  let bgClass = "bg-gray-700 text-white border-gray-600";
  let IconComponent = FiInfo;

  if (str.includes("low") || str.includes("safe") || str.includes("minimal")) {
    bgClass = "bg-emerald-600 text-white border-emerald-500 font-extrabold";
    IconComponent = FiCheckCircle;
  } else if (str.includes("medium") || str.includes("moderate") || str.includes("caution")) {
    bgClass = "bg-amber-500 text-white border-amber-400 font-extrabold";
    IconComponent = FiAlertTriangle;
  } else if (str.includes("high") || str.includes("dangerous") || str.includes("critical")) {
    bgClass = "bg-red-600 text-white border-red-500 font-extrabold";
    IconComponent = FiAlertOctagon;
  }

  return (
    <div
      className={`inline-flex items-center justify-center gap-1.5 px-3 h-8.5 text-xs rounded-xl shadow-xs whitespace-nowrap border tracking-wide uppercase ${
        isFullWidth ? "w-full" : "w-auto"
      } ${bgClass}`}
    >
      <IconComponent className="text-xs shrink-0" />
      <span className="truncate leading-none">{textVal}</span>
    </div>
  );
};

const formatUserDeviceTime = (timestamp) => {
  if (!timestamp) return "";
  let ts = String(timestamp);
  if (!ts.endsWith("Z") && !ts.includes("+")) {
    ts += "Z";
  }
  const date = new Date(ts);
  return isNaN(date.getTime()) ? String(timestamp) : date.toLocaleString();
};


const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://voyeger2026-backend.onrender.com";

const DEFAULT_DESTINATIONS = [
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

const PRESETS = [
  "What is the safety score of this destination?",
  "Tell me about common tourist scams here.",
  "Give me a 3-day itinerary focusing on safety.",
  "Is the current weather going to affect travel safety?",
  "Recommend nearby alternative spots to avoid crowds."
];

class AiCopilotErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AiCopilot caught a render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#ebebeb] flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-lg text-center shadow-xl space-y-4">
            <FiAlertOctagon className="mx-auto text-5xl text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">AI Copilot Recovered</h2>
            <p className="text-sm text-gray-600">
              An unexpected display issue occurred in the interface. Click below to reload the assistant.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-500 transition cursor-pointer"
            >
              Reload Assistant
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AiCopilotContent() {
  const { user } = useAppContext();
  const [selectedDest, setSelectedDest] = useState("");
  const [visitDate, setVisitDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [interests, setInterests] = useState([]);
  const [budget, setBudget] = useState("Medium");

  // RAG Prediction states
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insights, setInsights] = useState(null);

  // Chat states
  const [chatHistory, setChatHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // History states
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  const [destinations, setDestinations] = useState(DEFAULT_DESTINATIONS);

  useEffect(() => {
    // Scroll ONLY the chat container to bottom on updates (prevents scrolling whole page to footer)
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, sendingChat]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/ai/destinations`);
        if (response.data?.destinations?.length > 0) {
          setDestinations(response.data.destinations);
        }
      } catch (err) {
        console.warn("Could not load dynamic destinations, using defaults:", err.message);
      }
    };
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/ai/history`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setHistoryList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistoryList([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClearHistory = () => {
    if (!user) return;
    setShowClearModal(true);
  };

  const confirmClearHistory = async () => {
    setShowClearModal(false);
    try {
      await axios.delete(`${BACKEND_URL}/api/ai/history`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setHistoryList([]);
      toast.success("Prediction history cleared successfully!");
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error("Failed to clear prediction history.");
    }
  };

  const handleInterestToggle = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGetInsights = async () => {
    if (!user) {
      toast.error("Please log in to query the AI Copilot.");
      return;
    }
    // Destination is optional; user can include destination/context in the prompt
    setLoadingInsights(true);
    setInsights(null);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/predictions`,
        {
          destination: selectedDest || "",
          visit_date: visitDate,
          interests,
          budget
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      setInsights(response.data);
      toast.success("AI Insights fetched successfully!");
      fetchHistory(); // Refresh history log
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.details || "Failed to generate AI insights."
      );
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSendChat = async (messageToSend) => {
    const msg = messageToSend || query;
    if (!msg.trim()) return;
    if (!user) {
      toast.error("Please log in to chat with the AI Copilot.");
      return;
    }
    // Destination is optional; include context in the prompt instead of separate field

    const newChatHistory = [
      ...chatHistory,
      { role: "user", content: msg }
    ];

    setChatHistory(newChatHistory);
    setQuery("");
    setSendingChat(true);

    try {
      // Map frontend chat history format to what FastAPI expects
      const formattedHistory = chatHistory.map((item) => ({
        role: item.role === "user" ? "user" : "assistant",
        content: item.content
      }));

      const response = await axios.post(
        `${BACKEND_URL}/api/ai/chat`,
        {
          destination: selectedDest || "General",
          query: msg,
          visit_date: visitDate,
          chat_history: formattedHistory
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      const rawReply = response.data?.response ?? response.data?.reply ?? response.data;
      const safeReply = typeof rawReply === "string" 
        ? rawReply 
        : (rawReply?.message || (typeof rawReply === "object" ? JSON.stringify(rawReply) : String(rawReply || "No response received.")));

      setChatHistory([
        ...newChatHistory,
        { role: "assistant", content: safeReply }
      ]);
    } catch (error) {
      console.error(error);
      setChatHistory([
        ...newChatHistory,
        {
          role: "assistant",
          content: "⚠️ Sorry, I am having trouble connecting to the travel assistant. Please check your internet connection and try again."
        }
      ]);
    } finally {
      setSendingChat(false);
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-[#ebebeb] py-8 text-gray-800 relative">
      <div className="max-w-[1400px] mx-auto px-4 relative z-10 space-y-8">
        
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-300 pb-6 gap-4">
          <div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Voyager AI Tourism Copilot
            </h1>
            <p className="text-gray-600 mt-2 text-base md:text-lg">
              Unlock real-time travel intelligence, overcrowding detection, safety scoring, and smart recommendations.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-2xl shadow-sm">
            <FiActivity className="text-emerald-600 animate-pulse" />
            <div className="text-sm">
              <p className="text-gray-400 font-semibold text-[11px] uppercase tracking-wider">AI Copilot Status</p>
              <p className="text-gray-800 font-semibold">Connected</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & ML Insights */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Config Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                <FiCompass className="text-blue-600" /> Plan Your Destination
              </h2>

              <div className="space-y-4">
                {/* Destination Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1.5">
                    Enter Destination
                  </label>
                  <input
                    type="text"
                    list="destination-options"
                    placeholder="E.g. Goa, Ladakh, Purulia..."
                    value={selectedDest}
                    onChange={(e) => {
                      setSelectedDest(e.target.value);
                    }}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <datalist id="destination-options">
                    {destinations.map((dest, idx) => (
                      <option key={idx} value={dest} />
                    ))}
                  </datalist>
                </div>

                {/* Visit Date & Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1.5">
                      Visit Date
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1.5">
                      Budget Level
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Interests Checklist */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Travel Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Nature", "Culture", "Adventure", "History", "Relaxation", "Food"].map(
                      (interest) => {
                        const active = interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => handleInterestToggle(interest)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                              active
                                ? "bg-blue-100 border-blue-500 text-blue-700 font-bold"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetInsights}
                  disabled={loadingInsights}
                  className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold tracking-wide shadow-md hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loadingInsights ? (
                    <>
                      <div className="h-5 w-5 border-2 rounded-full animate-spin border-white/20 border-t-white" />
                      Analyzing Destination...
                    </>
                  ) : (
                    <>
                      <FiTrendingUp /> Run ML Insights
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ML Insights Panel */}
            {insights ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FiCompass className="text-blue-600 text-xl" /> ML Predictor Intelligence
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200/70">
                    Live Telemetry
                  </span>
                </div>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Safety Risk Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/40 border border-gray-200/80 p-3.5 rounded-2xl flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Safety</span>
                      <FiShield className="text-blue-600 text-base" />
                    </div>
                    <div className="space-y-1.5">
                      <div>{renderRiskBadge(insights.safety, true)}</div>
                      <p className="text-[11px] font-bold text-gray-500">
                        {(parseFloat(insights.safety_confidence || 0.85) * (insights.safety_confidence > 1 ? 1 : 100)).toFixed(0)}% Score
                      </p>
                    </div>
                  </div>

                  {/* Scam Risk Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-amber-50/40 border border-gray-200/80 p-3.5 rounded-2xl flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Scam Risk</span>
                      <FiAlertTriangle className="text-amber-600 text-base" />
                    </div>
                    <div className="space-y-1.5">
                      <div>{renderRiskBadge(insights.scam_risk, true)}</div>
                      <p className="text-[11px] font-bold text-gray-500">
                        {(parseFloat(insights.scam_confidence || 0.85) * (insights.scam_confidence > 1 ? 1 : 100)).toFixed(0)}% Rating
                      </p>
                    </div>
                  </div>

                  {/* Crowd Level Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-indigo-50/40 border border-gray-200/80 p-3.5 rounded-2xl flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Crowd Level</span>
                      <FiUsers className="text-indigo-600 text-base" />
                    </div>
                    <div className="space-y-1.5">
                      <div>{renderRiskBadge(insights.crowd_level, true)}</div>
                      <p className="text-[11px] font-bold text-gray-500">
                        {(parseFloat(insights.crowd_confidence || 0.80) * (insights.crowd_confidence > 1 ? 1 : 100)).toFixed(0)}% Density
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                {insights.recommendation && (
                  <div className="bg-blue-50/70 border border-blue-200/60 p-4 rounded-2xl space-y-1 shadow-xs">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FiCompass className="text-blue-600" /> Copilot Recommendation
                    </h4>
                    <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
                      {typeof insights.recommendation === "string" ? insights.recommendation : JSON.stringify(insights.recommendation)}
                    </p>
                  </div>
                )}

                {/* Safety Summary */}
                <div className="bg-gray-50 border border-gray-200/70 p-4 rounded-2xl space-y-1">
                  <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                    AI Diagnostic Summary
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
                    {typeof insights.summary === "string" ? insights.summary : JSON.stringify(insights.summary)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/40 border border-gray-300 border-dashed rounded-2xl p-8 text-center text-gray-500">
                <FiCompass className="mx-auto text-3xl mb-3 text-gray-400" />
                <p className="text-sm">Run ML Insights to view safety analysis, scam predictions, and dynamic traveler flows.</p>
              </div>
            )}
          </div>

          {/* Right Column: Chatbot & Copilot RAG Layer */}
          <div className="lg:col-span-7 flex flex-col h-[750px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
            {/* Chat header */}
            <div className="bg-gray-50 border-b border-gray-150 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl">
                  <img
                    src="/images/mountains.png"
                    alt="Voyager logo"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Travel Assistant Chat</h3>
                  <p className="text-xs text-gray-500">
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-600 border border-gray-250 px-3 py-1 rounded-full bg-white font-semibold">
                Destination: <span className="font-bold text-blue-600">{selectedDest}</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {chatHistory.length === 0 ? (
                <div className="min-h-full flex flex-col justify-center items-center text-center space-y-6">
                  <div className="bg-white border border-gray-200 p-6 rounded-full shadow-sm">
                    <img
                      src="/images/mountains.png"
                      alt="Assistant Logo"
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <div className="max-w-md">
                    <h4 className="font-bold text-lg text-gray-800">How can I help you in {selectedDest}?</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Choose a sample query below or type your own question to start the conversational copilot journey.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleSendChat(preset)}
                        className="text-left text-sm bg-white hover:bg-blue-50 border border-gray-200 p-3.5 rounded-2xl hover:border-blue-500/40 hover:text-blue-600 transition-all font-medium text-gray-700 shadow-sm"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        item.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`${
                          item.role === "user"
                            ? "max-w-[80%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-none px-4 py-3 text-sm leading-relaxed shadow-sm"
                            : "w-full text-gray-900 px-1 py-1 text-sm sm:text-base leading-relaxed"
                        }`}
                      >
                        {item.role === "user" ? (
                          <div className="whitespace-pre-wrap">{item.content}</div>
                        ) : (
                          renderFormattedMessage(item.content)
                        )}
                      </div>
                    </div>
                  ))}

                  {sendingChat && (
                    <div className="flex justify-start">
                      <div className="text-gray-600 text-sm flex items-center gap-2 py-1 px-1">
                        <div className="flex gap-1.5">
                          <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
                          <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span className="font-semibold text-xs text-gray-500">TripBuddy is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="bg-white border-t border-gray-150 p-4 flex gap-3"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Ask anything about visiting ${selectedDest}...`}
                disabled={sendingChat}
                className="flex-1 h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              />
              <button
                type="submit"
                disabled={sendingChat || !query.trim()}
                className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md cursor-pointer"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>

        {/* Prediction History Log */}
        {user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiCalendar className="text-blue-600" /> Prediction Logs
              </h3>
              {Array.isArray(historyList) && historyList.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all cursor-pointer shadow-sm hover:shadow"
                  title="Clear Prediction History"
                >
                  <FiTrash2 className="text-base" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 border-2 rounded-full animate-spin border-blue-500/20 border-t-blue-500" />
              </div>
            ) : !Array.isArray(historyList) || historyList.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No historical records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider">
                      <th className="pb-3 pr-4">Destination</th>
                      <th className="pb-3 px-4">Visit Date</th>
                      <th className="pb-3 px-4">Safety Risk</th>
                      <th className="pb-3 px-4">Scam Risk</th>
                      <th className="pb-3 px-4">Crowd Level</th>
                      <th className="pb-3 px-4">Recommendation</th>
                      <th className="pb-3 pl-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(Array.isArray(historyList) ? historyList : []).slice(0, 5).map((log, logIdx) => (
                      <tr key={log._id || log.id || logIdx} className="text-gray-800 hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 pr-4 font-extrabold text-gray-900 text-base">{log.destination_name}</td>
                        <td className="py-4 px-4 font-medium text-sm">{log.visit_date}</td>
                        <td className="py-4 px-4">
                          {renderRiskBadge(log.safety_risk)}
                        </td>
                        <td className="py-4 px-4">
                          {renderRiskBadge(log.scam_risk)}
                        </td>
                        <td className="py-4 px-4">
                          {renderRiskBadge(log.crowd_level)}
                        </td>
                        <td className="py-4 px-4 max-w-xs truncate text-sm font-medium text-gray-700" title={log.recommendation}>
                          {log.recommendation}
                        </td>
                        <td className="py-4 pl-4 text-xs font-semibold text-gray-500">
                          {formatUserDeviceTime(log.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Custom Theme Confirmation Modal */}
        {showClearModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 transform transition-all animate-scaleUp">
              <div className="flex items-center gap-3.5 text-amber-600 mb-4">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60">
                  <FiAlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Clear History Logs?</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 font-medium">
                Are you sure you want to permanently delete all prediction history logs from your travel assistant dashboard?
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmClearHistory}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Delete History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiCopilot() {
  return (
    <AiCopilotErrorBoundary>
      <AiCopilotContent />
    </AiCopilotErrorBoundary>
  );
}
