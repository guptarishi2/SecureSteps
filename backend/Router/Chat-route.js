const Router = require("express");
const verifytoken = require("../Middleware/verifytoken");

const ChatRouter = Router();

// Free Google Gemini key (https://aistudio.google.com/apikey). Optional: when it
// is not set, the endpoint still works using the offline scripted responder below.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_TIMEOUT_MS = 8000; // don't let a slow model hang an emergency chat
const MAX_TURN_CHARS = 1000; // cap each message before sending it to the model

// Best-effort, per-instance rate limit so one account can't drain the shared
// free-tier quota (which would knock everyone onto the offline responder during
// real emergencies). On limit we still answer — just from the offline responder.
const RATE_LIMIT_MAX = 20; // requests per user...
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // ...per minute
const recentHits = new Map(); // userId -> [timestamps]
function isRateLimited(userId) {
  const now = Date.now();
  const hits = (recentHits.get(userId) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  recentHits.set(userId, hits);
  return hits.length > RATE_LIMIT_MAX;
}

// Persona + safety guardrails for the assistant.
const SYSTEM_PROMPT = `You are "Saheli", a calm, warm emergency-support companion inside SecureSteps, a personal-safety app. The person messaging you may be frightened, in danger, or alone.
Your goals, in order:
1) Keep them calm and grounded — short, reassuring sentences, one gentle question at a time.
2) Keep them talking so they don't feel alone.
3) Offer practical safety: move toward a safe, public, well-lit place or a trusted person; remind them SecureSteps can share their live location with their saved emergency contacts using the "Share Location" button.
4) If there is real, immediate danger or any medical emergency, tell them to call emergency services NOW: 112 (India's single emergency number), 100 (police), 108 (ambulance), or 1091 (women's helpline). You are NOT a replacement for emergency services.
Rules: never give unsafe, illegal or risky advice; never claim you can contact authorities yourself; keep every reply under about 80 words; be kind and never judgmental.`;

// Offline, $0, keyword-aware responder. Used when there is no API key, the user
// is rate-limited, or Gemini is unreachable — so the chat ALWAYS responds with
// safety-first guidance. Branches are ordered most-urgent first; every branch
// surfaces emergency-call guidance and the live-location nudge.
function scriptedReply(message) {
  const t = String(message || "").toLowerCase();
  const has = (...words) => words.some((w) => t.includes(w));
  const nudge =
    ' Tap "Share Location" in SecureSteps so your emergency contacts can see where you are.';

  // 1) Medical / life-threatening distress — highest priority. Choking,
  // strangulation and "can't breathe" must get ambulance guidance, never a
  // breathing exercise.
  if (
    has(
      "can't breathe", "cant breathe", "can not breathe", "cannot breathe", "out of breath",
      "chok", "strangl", "chest pain", "unconscious", "passed out", "not breathing",
      "overdose", "won't stop bleeding", "wont stop bleeding", "bleeding a lot"
    )
  ) {
    return (
      "This needs urgent help right now. Call 112 or 108 for an ambulance immediately. Stay as still and upright as you can, and keep someone with you if possible. Tell me where you are so help can reach you." +
      nudge
    );
  }

  // 2) Immediate violent danger — weapons, assault, abduction, intrusion, fire.
  if (
    has(
      "rape", "raped", "molest", "touching me", "groped", "knife", "gun", "weapon", "armed",
      "kidnap", "abduct", "hostage", "intruder", "broke in", "break in", "breaking in",
      "someone in my house", "at my window", "at my door", "threaten", "kill me", "stab",
      "spiked", "drugged", "fire", "trapped"
    )
  ) {
    return (
      "I'm taking this seriously and I'm right here with you. Call 112 now — the police can reach you fastest. If you can, get to a locked room or a crowd of people and stay on the call with them." +
      nudge
    );
  }

  // 3) Being followed or stalked.
  if (has("follow", "stalk", "chasing", "behind me", "watching me", "tailing")) {
    return (
      "Stay calm — you're doing the right thing by reaching out. Head into the nearest open shop, cafe or any crowded, well-lit place and stay around people. If you feel unsafe, call 112 right now." +
      nudge
    );
  }

  // 4) Physical injury / assault.
  if (has("hurt", "injured", "bleeding", "attacked", "assault", "wound", "grabbed", "punched", "beaten", "hit me", "pushed me")) {
    return (
      "I'm here with you. If you're injured, call 112 or 108 for an ambulance right away. Try to get to a safe spot and press firmly on any bleeding. Is someone nearby who can help you?" +
      nudge
    );
  }

  // 5) Lost / disoriented.
  if (has("lost", "don't know where", "dont know where", "no idea where", "where am i")) {
    return (
      "That's okay, we'll work it out together. Look for a shop sign, street name or landmark and tell me what you see. Sharing your live location will also let your contacts find you." +
      nudge
    );
  }

  // 6) Anxiety / panic — only reached when no danger keyword matched above. Offer
  // grounding, but still remind them help is one call away.
  if (has("scared", "afraid", "panic", "anxious", "nervous", "shaking", "stay calm", "calm down", "breathe", "breathing")) {
    return (
      "Take a slow breath in… and out. You're not alone, I'm right here with you. Try this: name 5 things you can see, 4 you can hear, 3 you can touch. Where are you right now? If anything feels unsafe, call 112." +
      nudge
    );
  }

  // 7) Reassurance — ONLY for a clearly affirmative "I'm safe now" message with
  // no sign of ongoing danger. Errs toward safety guidance whenever unsure.
  const affirmativeSafe = /\b(i('?m| am)( now)? safe|i('?m| am)( now)? home|safe now|reached home|i('?m| am)( now)? (ok|okay|fine)|okay now|fine now|feel safe)\b/.test(t);
  const dangerWord = has(
    "not safe", "unsafe", "n't safe", "man", "men", "guy", "stranger", "someone", "window",
    "door", "outside", "follow", "stalk", "knife", "gun", "weapon", "attack", "threat",
    "intrud", "break", "broke in", "blood", "alone", "scared", "afraid", "help", "coming", "still here"
  );
  if (affirmativeSafe && !dangerWord) {
    return "I'm so glad you're safe. Stay with someone you trust if you can, and keep your phone close. I'm here if you need to talk — and if anything changes, call 112 straight away.";
  }

  // 8) Catch-all — always surfaces emergency numbers and the location nudge.
  return (
    "I'm here for you and listening. Tell me what's happening and where you are, and we'll take it one step at a time. If you're in immediate danger, call 112 now (100 police, 108 ambulance, 1091 women's helpline)." +
    nudge
  );
}

// Map the client's [{role:'user'|'assistant', content}] history to Gemini's
// contents format (roles must be 'user' or 'model'). Constraints handled:
//  - cap history (turns) and each turn's length so the free-tier budget stays small
//  - Gemini requires the sequence to START with a user turn, but our UI opens
//    with an assistant greeting, so drop any leading model turns.
function toGeminiContents(messages) {
  const contents = messages
    .slice(-20)
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.slice(0, MAX_TURN_CHARS) }],
    }));
  while (contents.length && contents[0].role === "model") contents.shift();
  return contents;
}

async function askGemini(messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      method: "POST",
      // Key in a header, not the URL, so it doesn't land in request logs.
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: toGeminiContents(messages),
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      }),
    });
    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      throw new Error(`Gemini ${resp.status}: ${detail.slice(0, 200)}`);
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
    if (!text) throw new Error("Gemini returned no text");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

ChatRouter.post("/chat", verifytoken, async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    if (!messages.length) {
      return res.status(400).json({ message: "No message provided" });
    }

    const lastUser = [...messages].reverse().find((m) => m && m.role === "user");
    const lastUserText = typeof lastUser?.content === "string" ? lastUser.content : "";

    const userId = req.userid?.user?.id || req.userid?.user?.mobilenumber || "anon";
    const limited = isRateLimited(userId);

    // Use the free AI only when: a key is set, the user isn't flooding the shared
    // quota, and there is real text to send (an empty turn would just 400 anyway).
    if (GEMINI_API_KEY && !limited && lastUserText.trim()) {
      try {
        const reply = await askGemini(messages);
        return res.status(200).json({ reply, source: "ai" });
      } catch (err) {
        console.error("Gemini error, using offline fallback:", err.message);
      }
    }

    return res.status(200).json({ reply: scriptedReply(lastUserText), source: "offline" });
  } catch (e) {
    console.error("Chat error:", e.message);
    // Even on an unexpected error, return a calming reply rather than a hard fail.
    return res.status(200).json({
      reply:
        "I'm here with you. If you're in immediate danger, please call 112 right now. Try to get to a safe, public place.",
      source: "offline",
    });
  }
});

module.exports = ChatRouter;
