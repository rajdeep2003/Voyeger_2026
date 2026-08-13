import React from "react";
import {
  FiShield,
  FiAlertTriangle,
  FiUsers,
  FiCompass,
  FiActivity,
  FiCheckCircle,
  FiAlertOctagon,
  FiInfo,
  FiTag,
  FiDollarSign,
  FiNavigation,
  FiHelpCircle
} from "react-icons/fi";

const stripEmojis = (str) =>
  typeof str === "string"
    ? str
        .replace(
          /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}🔴🟡🟢📊🎫🗺️💡🛡️⚠️👥]/gu,
          ""
        )
        .trim()
    : String(str || "");

/**
 * Parses structured AI responses (stripping raw emojis and rendering professional React Icons for headers and status metrics)
 * for a sleek, enterprise travel assistant interface.
 */
export const renderFormattedMessage = (content) => {
  if (!content) return null;
  const safeContent = typeof content === "string" ? content : String(content);

  try {
    // Clean all raw emoji characters from incoming text content
    const cleanContent = stripEmojis(safeContent);
    const lines = cleanContent.split("\n");
    const elements = [];
    let currentStatusMetrics = [];

    const flushStatusMetrics = (key) => {
      if (currentStatusMetrics.length > 0) {
        elements.push(
          <div key={key} className="flex flex-wrap gap-2.5 my-3 w-full">
            {currentStatusMetrics.map((metric, mIdx) => {
              let badgeBg = "bg-gray-100 text-gray-800 border-gray-200/80";
              let StatusIcon = FiCheckCircle;
              const lowerStatus = (metric.status || "").toLowerCase();
              
              if (
                lowerStatus.includes("danger") ||
                lowerStatus.includes("high") ||
                lowerStatus.includes("critical")
              ) {
                badgeBg = "bg-red-50 text-red-800 border-red-200/80 font-bold";
                StatusIcon = FiAlertOctagon;
              } else if (
                lowerStatus.includes("caution") ||
                lowerStatus.includes("medium") ||
                lowerStatus.includes("moderate") ||
                lowerStatus.includes("warning")
              ) {
                badgeBg = "bg-amber-50 text-amber-900 border-amber-200/80 font-bold";
                StatusIcon = FiAlertTriangle;
              } else if (
                lowerStatus.includes("safe") ||
                lowerStatus.includes("low") ||
                lowerStatus.includes("success")
              ) {
                badgeBg = "bg-emerald-50 text-emerald-900 border-emerald-200/80 font-bold";
                StatusIcon = FiCheckCircle;
              }

              // Determine professional vector icon for metric type
              let MetricTypeIcon = FiActivity;
              const lowerLabel = (metric.label || "").toLowerCase();
              if (lowerLabel.includes("crowd")) {
                MetricTypeIcon = FiUsers;
              } else if (lowerLabel.includes("safety")) {
                MetricTypeIcon = FiShield;
              } else if (lowerLabel.includes("scam")) {
                MetricTypeIcon = FiAlertTriangle;
              }

              const displayStatus = (metric.status || "").trim();

            let formattedConf = metric.confidence;
            if (formattedConf) {
              const cleanConf = formattedConf
                .replace(/model confidence|ai confidence|confidence|crowd density|safety score|protection rating|telemetry score/gi, "")
                .trim();
              if (lowerLabel.includes("crowd")) {
                formattedConf = `${cleanConf} Crowd Density`;
              } else if (lowerLabel.includes("safety")) {
                formattedConf = `${cleanConf} Safety Score`;
              } else if (lowerLabel.includes("scam")) {
                formattedConf = `${cleanConf} Protection Rating`;
              } else {
                formattedConf = `${cleanConf} Telemetry Score`;
              }
            }

            return (
              <div
                key={mIdx}
                className={`px-4 py-2.5 border rounded-2xl flex items-center gap-2.5 text-sm sm:text-base transition-all shadow-xs ${badgeBg}`}
              >
                <MetricTypeIcon className="text-lg shrink-0" />
                <span className="font-extrabold uppercase tracking-wide opacity-90 text-xs sm:text-sm">{metric.label}:</span>
                <span className="font-black flex items-center gap-1.5 text-sm sm:text-base">
                  <StatusIcon className="text-base shrink-0" />
                  {displayStatus}
                </span>
                {formattedConf && (
                  <span className="opacity-90 font-semibold text-xs sm:text-sm ml-1">
                    ({formattedConf})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
      currentStatusMetrics = [];
    }
  };

  const formatBoldText = (text) => {
    const cleaned = stripEmojis(text);
    const parts = cleaned.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-extrabold text-gray-900">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = stripEmojis(line.trim());
    if (!trimmed) {
      flushStatusMetrics(`status-flush-${i}`);
      const nextLine = stripEmojis(lines[i + 1]?.trim());
      const isNextHeader = nextLine && /^[A-Z\s&]{3,}:/.test(nextLine);
      if (!isNextHeader) {
        elements.push(<div key={`space-${i}`} className="h-1.5" />);
      }
      continue;
    }

    const cleanLine = trimmed.replace(/\*\*/g, "");

    // Check if it's a status metric line (e.g. • Crowd Level: High (confidence: 85%))
    const metricMatch = cleanLine.match(/^[•*\-\s]*([^:]+):\s*(.*)/);
    if (
      metricMatch &&
      (cleanLine.toLowerCase().includes("crowd level") ||
        cleanLine.toLowerCase().includes("safety risk") ||
        cleanLine.toLowerCase().includes("scam risk"))
    ) {
      const label = metricMatch[1].trim();
      const rest = metricMatch[2].trim();

      let status = rest;
      let confidence = "";

      const confMatch = rest.match(/\((?:confidence:\s*)?([^)]+)\)/i);
      if (confMatch) {
        let confidenceText = confMatch[1];
        const num = parseFloat(confidenceText);
        if (!isNaN(num) && num > 0 && num <= 1) {
          confidenceText = `${Math.round(num * 100)}%`;
        }
        confidence = confidenceText;
        status = rest.replace(/\s*\([^)]+\)/, "").trim();
      }

      currentStatusMetrics.push({
        label,
        status,
        confidence,
      });
      continue;
    }

    // Flush any accumulated status metrics before standard content
    flushStatusMetrics(`status-flush-${i}`);

    // Check if it's a major section header (e.g. DESTINATION STATUS: or TICKET & PRICING:)
    const isHeader = /^[A-Z\s&]{3,}:/.test(cleanLine);
    if (isHeader) {
      const upperHeader = cleanLine.toUpperCase();
      let HeaderIcon = FiTag;
      if (upperHeader.includes("STATUS")) HeaderIcon = FiActivity;
      else if (upperHeader.includes("SAFETY") || upperHeader.includes("TIPS") || upperHeader.includes("ALERT") || upperHeader.includes("OVERVIEW")) HeaderIcon = FiShield;
      else if (upperHeader.includes("RECOMMEND") || upperHeader.includes("HIGHLIGHT") || upperHeader.includes("ROUTE")) HeaderIcon = FiCompass;
      else if (upperHeader.includes("TICKET") || upperHeader.includes("PRICING") || upperHeader.includes("COST")) HeaderIcon = FiDollarSign;

      elements.push(
        <div
          key={`header-${i}`}
          className="font-black text-gray-900 mt-6 mb-3 border-b border-gray-200/90 pb-2 text-base sm:text-lg flex items-center gap-2.5 uppercase tracking-wider"
        >
          <HeaderIcon className="text-blue-600 text-xl shrink-0" />
          {formatBoldText(trimmed)}
        </div>
      );
      continue;
    }

    // Check if it's a bullet point (starts with • or * or -)
    if (trimmed.startsWith("•") || trimmed.startsWith("*") || trimmed.startsWith("-")) {
      const contentText = trimmed.replace(/^[•*\-]\s*/, "");
      elements.push(
        <div key={`bullet-${i}`} className="pl-6 relative text-base sm:text-[17px] text-gray-800 leading-relaxed my-2">
          <span className="absolute left-1.5 top-3 h-2 w-2 bg-blue-600 rounded-full" />
          {formatBoldText(contentText)}
        </div>
      );
      continue;
    }

    // Check if it's a numbered list item (starts with a number + dot)
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const contentText = numMatch[2];
      elements.push(
        <div key={`num-${i}`} className="pl-7 relative text-base sm:text-[17px] text-gray-800 leading-relaxed my-2">
          <span className="absolute left-0 font-extrabold text-blue-600 text-base sm:text-[17px]">{num}.</span>
          {formatBoldText(contentText)}
        </div>
      );
      continue;
    }

    // Regular line
    elements.push(
      <p key={`text-${i}`} className="text-base sm:text-[17px] text-gray-800 leading-relaxed my-2">
        {formatBoldText(trimmed)}
      </p>
    );
  }

  // Flush any remaining status metrics at the end of content
  flushStatusMetrics("status-flush-end");

  return <div className="space-y-3 w-full">{elements}</div>;
  } catch (err) {
    console.error("Error formatting message:", err);
    return <div className="whitespace-pre-wrap text-base text-gray-800 leading-relaxed">{content}</div>;
  }
};
