import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import { FiMessageSquare, FiX, FiSend, FiCompass, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { renderFormattedMessage } from "../../../utils/aiFormatter";
import gsap from "gsap";



const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const BACKEND_URL = isLocalhost
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
  "Is this place safe for tourists?",
  "Common scams to avoid here?",
  "Suggest a 2-day itinerary.",
  "How is the current weather?"
];

export default function TripBuddy() {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  // Destination field is now optional — user will include any context directly in their prompt
  const [selectedDest, setSelectedDest] = useState("");
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  const [destinations, setDestinations] = useState(DEFAULT_DESTINATIONS);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/ai/destinations`);
        if (response.data?.destinations?.length > 0) {
          setDestinations(response.data.destinations);
        }
      } catch (err) {
        console.warn("Could not load dynamic destinations in TripBuddy:", err.message);
      }
    };
    fetchDestinations();
  }, []);

  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const chatContentRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !iconRef.current || !chatContentRef.current) return;

    const targetWidth = window.innerWidth < 640 ? Math.min(window.innerWidth - 32, 460) : 540;
    const targetHeight = window.innerHeight < 700 ? Math.min(window.innerHeight - 40, 580) : 680;

    if (isOpen) {
      // Morph Open: transition container from button to chat card, fade out icon, fade in chat
      gsap.killTweensOf([containerRef.current, iconRef.current, chatContentRef.current]);

      // 1. Smoothly fade out the Mountain icon
      gsap.to(iconRef.current, {
        opacity: 0,
        scale: 0.25,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(iconRef.current, { display: "none" });
        }
      });

      // 2. Expand and morph the container shape
      gsap.to(containerRef.current, {
        width: targetWidth,
        height: targetHeight,
        borderRadius: "24px",
        backgroundColor: "#ffffff",
        borderWidth: "1px",
        borderColor: "rgba(229, 231, 235, 1)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        duration: 0.65,
        ease: "power4.out"
      });

      // 3. Fade in the chat screen contents
      gsap.set(chatContentRef.current, { display: "flex" });
      gsap.fromTo(
        chatContentRef.current,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          delay: 0.2,
          ease: "power2.out"
        }
      );
    } else {
      // Morph Closed: transition container back to button, fade out chat, fade in icon
      gsap.killTweensOf([containerRef.current, iconRef.current, chatContentRef.current]);

      // 1. Fade out the chat content
      gsap.to(chatContentRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(chatContentRef.current, { display: "none" });
        }
      });

      // 2. Shrink container back to circle
      gsap.to(containerRef.current, {
        width: 56,
        height: 56,
        borderRadius: "50%",
        backgroundColor: "#2563eb",
        borderWidth: "0px",
        borderColor: "transparent",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        duration: 0.6,
        ease: "back.inOut(1.4)"
      });

      // 3. Restore the floating sparkles icon
      gsap.set(iconRef.current, { display: "flex" });
      gsap.fromTo(
        iconRef.current,
        { opacity: 0, scale: 0.3 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          delay: 0.15,
          ease: "back.out(1.5)"
        }
      );
    }
  }, [isOpen]);

  const handleContainerClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };


  const handleSendChat = async (messageToSend) => {
    const msg = messageToSend || query;
    if (!msg.trim()) return;
    if (!user) {
      toast.error("Please log in to chat with TripBuddy.");
      return;
    }
    // Destination is optional; front-end will not block if it's empty.

    const newChatHistory = [
      ...chatHistory,
      { role: "user", content: msg }
    ];

    setChatHistory(newChatHistory);
    setQuery("");
    setSendingChat(true);

    try {
      const formattedHistory = chatHistory.map((item) => ({
        role: item.role === "user" ? "user" : "assistant",
        content: item.content
      }));

      const response = await axios.post(
        `${BACKEND_URL}/api/ai/chat`,
        {
          destination: selectedDest || "General",
          query: msg,
          chat_history: formattedHistory
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      setChatHistory([
        ...newChatHistory,
        { role: "assistant", content: response.data.response }
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
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={`shadow-2xl overflow-hidden flex items-center justify-center relative select-none ${
          isOpen
            ? "cursor-default border border-gray-200 rounded-3xl bg-white"
            : "cursor-pointer rounded-full bg-blue-600 hover:scale-105 transition-transform duration-200"
        }`}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "#2563eb",
        }}
      >
        {/* Floating Mountain Toggle Button - Visible when closed */}
        <div
          ref={iconRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img
            src="/images/mountains.png"
            alt="Voyager logo"
            className="h-7 w-7 object-contain brightness-0 invert"
          />
          <span className="absolute -top-1 -right-1 flex h-4 w-4"></span>
        </div>

        {/* Chat window content - Visible when open */}
        <div
          ref={chatContentRef}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full flex flex-col select-text"
          style={{ display: "none" }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <img
                    src="/images/mountains.png"
                    alt="Voyager logo"
                    className="h-5 w-5 object-contain brightness-0 invert"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm">TripBuddy AI</h3>
                  <p className="text-[10px] text-blue-100 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Online Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Destination Selector */}
            <div className="bg-gray-50 border-b border-gray-150 px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                <FiCompass className="text-blue-500" /> Guide Context:
              </span>
              <input
                type="text"
                list="tripbuddy-destination-options"
                placeholder="E.g. Purulia, Kashmir..."
                value={selectedDest}
                onChange={(e) => {
                  setSelectedDest(e.target.value);
                  setChatHistory([]); // Clear chat history when switching context
                }}
                className="flex-1 w-full text-xs rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-normal"
              />
              <datalist id="tripbuddy-destination-options">
                {destinations.map((dest, idx) => (
                  <option key={idx} value={dest} />
                ))}
              </datalist>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 bg-gray-50/50 flex flex-col">
              {!user ? (
                <div className="h-full flex flex-col justify-center items-center text-center w-full">
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-3">
                    <FiInfo className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">Authentication Required</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                    Please log in to your account to speak with TripBuddy.
                  </p>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-4 w-full">
                  <div className="bg-white border border-gray-200 p-4 rounded-full shadow-sm">
                    <img
                      src="/images/mountains.png"
                      alt="Assistant Logo"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">
                      Hi, I'm TripBuddy!
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-[260px]">
                      Ask me anything about traveling to <span className="font-semibold text-blue-600">{selectedDest}</span>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 max-w-[320px] w-full pt-2">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleSendChat(preset)}
                        className="text-left text-xs bg-white hover:bg-blue-50 border border-gray-200 p-3 rounded-xl hover:border-blue-500/40 hover:text-blue-600 transition-all font-medium text-gray-700 shadow-sm"
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
                            ? "max-w-[85%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-none px-4 py-3 text-sm leading-relaxed shadow-sm"
                            : "w-full text-gray-900 px-1 py-1 text-sm sm:text-[15px] leading-relaxed"
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

            {/* Input Footer */}
            {user && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="bg-white border-t border-gray-150 p-3 flex gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Ask TripBuddy about ${selectedDest}...`}
                  disabled={sendingChat}
                  className="flex-1 h-10 rounded-xl bg-gray-50 border border-gray-200 px-3.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !query.trim()}
                  className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </form>
            )}
        </div>
      </div>
    </div>
  );
}
