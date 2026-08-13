import os
import requests
import json
import logging
import asyncio
from datetime import datetime, timezone
from app.db.database import destinations_collection, reports_collection, prediction_collection
from app.services.destination_service import get_destination_details
from app.services.feature_builder import build_features
from app.services.recommendation_service import get_recommendation
from app.ml.safety_predictor import predict_safety
from app.ml.scam_predictor import predict_scam
from app.ml.tourism_predictor import predict_tourism

logger = logging.getLogger(__name__)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma2:2b")

async def get_destination_context(destination_name: str, visit_date: str = None) -> dict:
    """
    Retrieves destination metadata, predictions, and reports from MongoDB for RAG.
    If no stored prediction exists or to record active telemetry, computes/saves prediction.
    """
    target_visit_date = visit_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 1. Get destination details
    destination = await destinations_collection.find_one({"destination_name": destination_name})
    
    # 2. Get latest predictions
    prediction = await prediction_collection.find_one(
        {"destination_name": destination_name},
        sort=[("timestamp", -1)]
    )

    # If no prediction exists yet in DB or to ensure prediction history is logged
    if not prediction:
        try:
            dest_details = await get_destination_details(destination_name)
            if not dest_details:
                dest_details = {
                    "city": destination_name or "General",
                    "category": "General",
                    "latitude": 20.5937,
                    "longitude": 78.9629
                }
            safety_features, scam_features, tourism_features = build_features(dest_details, target_visit_date)
            safety_res = predict_safety(safety_features.model_dump())
            scam_res = predict_scam(scam_features.model_dump())
            tourism_res = predict_tourism(tourism_features.model_dump())
            rec = get_recommendation(destination_name, tourism_res["crowd_level"])
            summary_txt = f"{destination_name} is currently experiencing {tourism_res['crowd_level'].lower()} crowd density. Safety level is {safety_res['risk']} with {scam_res['scam_risk']} scam risk."
            
            prediction = {
                "destination_name": destination_name,
                "visit_date": target_visit_date,
                "safety_risk": safety_res["risk"],
                "safety_confidence": safety_res["confidence"],
                "scam_risk": scam_res["scam_risk"],
                "scam_confidence": scam_res["confidence"],
                "crowd_level": tourism_res["crowd_level"],
                "crowd_confidence": tourism_res["confidence"],
                "recommendation": rec,
                "summary": summary_txt,
                "timestamp": datetime.now(timezone.utc)
            }
            asyncio.create_task(prediction_collection.insert_one(prediction))
        except Exception as e:
            logger.warning(f"Could not compute dynamic live ML prediction for {destination_name}: {e}")
    else:
        # Save a log entry for history tracking if timestamp is older
        try:
            log_record = {
                "destination_name": destination_name,
                "visit_date": prediction.get("visit_date") or target_visit_date,
                "safety_risk": prediction.get("safety_risk", "Low Risk"),
                "safety_confidence": prediction.get("safety_confidence", 0.85),
                "scam_risk": prediction.get("scam_risk", "Low Risk"),
                "scam_confidence": prediction.get("scam_confidence", 0.85),
                "crowd_level": prediction.get("crowd_level", "Moderate"),
                "crowd_confidence": prediction.get("crowd_confidence", 0.80),
                "recommendation": prediction.get("recommendation", f"Travel guidance for {destination_name}"),
                "summary": prediction.get("summary", ""),
                "timestamp": datetime.now(timezone.utc)
            }
            asyncio.create_task(prediction_collection.insert_one(log_record))
        except Exception as e:
            logger.warning(f"Could not insert prediction log record: {e}")
    
    # 3. Get user reports
    reports = []
    if destination:
        dest_id_str = str(destination["_id"])
        async for r in reports_collection.find({"destination_id": dest_id_str}):
            reports.append({
                "incident_type": r.get("incident_type"),
                "severity": r.get("severity"),
                "description": r.get("description")
            })
            
    async for r in reports_collection.find({"destination_id": destination_name}):
        reports.append({
            "incident_type": r.get("incident_type"),
            "severity": r.get("severity"),
            "description": r.get("description")
        })

    return {
        "metadata": destination,
        "prediction": prediction,
        "reports": reports
    }

async def call_gemini_fallback(messages: list) -> str:
    """
    Calls the Gemini API (gemini-flash-latest) using the GOOGLE_API_KEY env variable as a fallback.
    """
    google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not google_api_key:
        logger.warning("GOOGLE_API_KEY not found in environment. Skipping Gemini fallback.")
        return ""
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={google_api_key}"
    headers = {"Content-Type": "application/json"}
    
    formatted_contents = []
    system_instruction = ""
    
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content", "")
        
        if role == "system":
            system_instruction = content
        elif role == "user":
            formatted_contents.append({"role": "user", "parts": [{"text": content}]})
        elif role == "assistant":
            formatted_contents.append({"role": "model", "parts": [{"text": content}]})
            
    payload = {"contents": formatted_contents}
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }
        
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            res_data = response.json()
            candidates = res_data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
        else:
            logger.error(f"Gemini API returned status code {response.status_code}: {response.text}")
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        
    return ""

async def generate_travel_copilot_response(destination_name: str, query: str, chat_history: list = None, visit_date: str = None) -> str:
    """
    Retrieves context for the destination (RAG) and calls LLM inference engine.
    """
    # Fetch RAG Context
    context = await get_destination_context(destination_name, visit_date=visit_date)
    
    metadata = context["metadata"]
    pred = context["prediction"]
    reports = context["reports"]
    
    # Format context for the LLM
    context_str = f"Destination: {destination_name}\n"
    if metadata:
        context_str += (
            f"Location: {metadata.get('state', '')}, {metadata.get('country', '')}\n"
            f"Category: {metadata.get('category', '')}\n"
            f"Description: {metadata.get('description', '')}\n"
        )
    else:
        context_str += "Metadata: No metadata found in database.\n"
        
    if pred:
        safety_conf = pred.get('safety_confidence', 0)
        scam_conf = pred.get('scam_confidence', 0)
        crowd_conf = pred.get('crowd_confidence', 0)
        
        # Convert decimal (e.g. 0.85) to percentage if needed
        safety_pct = f"{safety_conf * 100:.0f}%" if safety_conf <= 1 else f"{safety_conf:.0f}%"
        scam_pct = f"{scam_conf * 100:.0f}%" if scam_conf <= 1 else f"{scam_conf:.0f}%"
        crowd_pct = f"{crowd_conf * 100:.0f}%" if crowd_conf <= 1 else f"{crowd_conf:.0f}%"

        context_str += (
            f"ML Prediction Metrics:\n"
            f" - Safety Risk Level: {pred.get('safety_risk', 'Unknown')} (confidence: {safety_pct} Safety Score)\n"
            f" - Scam Risk Level: {pred.get('scam_risk', 'Unknown')} (confidence: {scam_pct} Protection Rating)\n"
            f" - Crowd Level: {pred.get('crowd_level', 'Unknown')} (confidence: {crowd_pct} Crowd Density)\n"
            f" - Recommendation: {pred.get('recommendation', '')}\n"
            f" - AI Summary: {pred.get('summary', '')}\n"
        )
    else:
        context_str += "ML Prediction Metrics: No recent safety predictions stored.\n"
        
    if reports:
        context_str += "Recent User-Submitted Incidents/Reports:\n"
        for i, r in enumerate(reports, 1):
            context_str += f" {i}. [{r['incident_type']} - Severity {r['severity']}/10] {r['description']}\n"
    else:
        context_str += "Recent User-Submitted Incidents: No reports filed for this destination.\n"
        
    # Construct System Prompt
    system_prompt = (
        "You are Voyager Copilot, an advanced AI travel intelligence assistant.\n"
        "Your goal is to guide tourists safely and offer personalized suggestions based on the provided context (destination metadata, user reports, and ML predictions).\n\n"
        "CRITICAL INSTRUCTION:\n"
        "You MUST directly answer and justify the user's specific prompt (whether typed manually or selected from sample prompts). If the user asks for an itinerary (e.g. 3-day itinerary), organize your response into daily steps or itinerary breakdown. If the user asks about scams, focus specifically on scam types and prevention. Tailor your response headers and content directly to what the user requested.\n\n"
        "RESPONSE FORMAT RULES:\n"
        "1. Directly answer the user's exact query first and structure sections to directly match their request.\n"
        "2. Avoid long paragraphs at all costs. Keep explanations short, clear, and direct (max 1-2 sentences per point).\n"
        "3. DO NOT use emojis. Never include any emoji characters in your response.\n"
        "4. Include the status block at the top when asked about status or at start:\n"
        "   DESTINATION STATUS:\n"
        "   • Crowd Level: [Level] (confidence: [X]% Crowd Density)\n"
        "   • Safety Risk: [Risk] (confidence: [Y]% Safety Score)\n"
        "   • Scam Risk: [Risk] (confidence: [Z]% Protection Rating)\n"
        "5. Organize the rest of the response using clean, CAPITALIZED section headers without emojis. Match the section titles to the user's prompt (e.g., DAY 1:, DAY 2:, COMMON SCAMS:, RECOMMENDED HIGHLIGHTS:, SAFETY TIPS:).\n"
        "6. Use bullet points (•) and numbered lists (1., 2.) inside these sections instead of normal paragraph blocks.\n"
        "7. Keep the tone professional, helpful, and safety-first. Do not mention database systems, FastAPI, MongoDB, or RAG details."
    )
    
    # Construct Messages List
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Context:\n{context_str}\n\nUser Query: {query}"}
    ]
    
    # Add chat history if present
    if chat_history:
        for msg in chat_history:
            messages.insert(1, {"role": msg.get("role", "user"), "content": msg.get("content", "")})

    # Prioritize Gemini API if key is present for instant <1s responses
    if os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"):
        gemini_text = await call_gemini_fallback(messages)
        if gemini_text:
            return gemini_text
            
    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_predict": 256,
            "num_ctx": 2048
        }
    }
    
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=6)
        if response.status_code == 200:
            res_data = response.json()
            llm_text = res_data.get("message", {}).get("content", "")
            if llm_text:
                return llm_text
        
        logger.warning(f"Ollama returned status code {response.status_code}. Falling back to Gemini API.")
    except Exception as e:
        logger.warning(f"Error/Timeout communicating with local Ollama LLM: {e}. Falling back to Gemini API.")
        
    # Fallback to Gemini if not called earlier
    gemini_text = await call_gemini_fallback(messages)
    if gemini_text:
        return gemini_text
    if gemini_text:
        return gemini_text
        
    logger.warning("Gemini API fallback failed or key was missing. Falling back to rule-based generation.")
        
    # Rule-based fallback (RAG-based response)
    fallback_text = (
        f"**Hello! I am Voyager Copilot.** (Offline Mode)\n"
        f"Here is the safety summary for **{destination_name}**:\n\n"
    )
    if pred:
        safety_risk = pred.get('safety_risk', 'Unknown')
        scam_risk = pred.get('scam_risk', 'Unknown')
        crowd_level = pred.get('crowd_level', 'Unknown')

        fallback_text += (
            f"DESTINATION STATUS:\n"
            f"• Crowd Level: {crowd_level} (confidence: {pred.get('crowd_confidence', 0)*100:.0f}%)\n"
            f"• Safety Risk: {safety_risk} (confidence: {pred.get('safety_confidence', 0)*100:.0f}%)\n"
            f"• Scam Risk: {scam_risk} (confidence: {pred.get('scam_confidence', 0)*100:.0f}%)\n\n"
            f"RECOMMENDATION:\n"
            f"{pred.get('summary', '')}\n"
        )
    else:
        fallback_text += "No active prediction reports or safety metrics are registered for this location.\n"
        
    if reports:
        fallback_text += "\nRECENT ALERTS:\n"
        for r in reports[:2]:
            fallback_text += f"• [{r['incident_type']}] {r['description']}\n"
            
    return fallback_text
