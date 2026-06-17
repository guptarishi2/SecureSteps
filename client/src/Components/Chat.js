import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import { API_BASE } from "../config";

const GREETING =
  "Hi, I'm Saheli 💙 I'm here with you. Tell me what's happening or how you're feeling — we'll take it one step at a time. If you're in immediate danger, call 112 now.";

// Shown only if the backend can't be reached at all, so the user is never left
// without a calming response during an emergency.
const OFFLINE_FALLBACK =
  "I'm still here with you. If you're in immediate danger, please call 112 right now and move toward a safe, public place. You can also tap \"Share Location\" so your contacts can find you.";

// Browser-native speech recognition (Chrome/Edge). Free, no dependency.
const SpeechRecognition =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function Chat() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesRef = useRef(messages);

  // Auto-scroll to the latest message.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Mirror messages into a ref so async callbacks (e.g. a slow speech result)
  // build history from the latest committed messages, not a stale closure.
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Stop the microphone and any spoken reply when leaving this screen, so the
  // mic doesn't stay hot and Saheli's voice doesn't keep talking on the next page.
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch (_) {
        /* ignore */
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Read an assistant reply aloud when voice output is enabled.
  const speak = (text) => {
    if (!speakReplies || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new window.SpeechSynthesisUtterance(text));
    } catch (_) {
      /* speech synthesis unavailable — ignore */
    }
  };

  const sendMessage = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const nextMessages = [...messagesRef.current, { role: "user", content }];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/user/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await resp.json().catch(() => ({}));
      const reply = resp.ok && data.reply ? data.reply : OFFLINE_FALLBACK;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: OFFLINE_FALLBACK }]);
      speak(OFFLINE_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  // Dictate a message with the microphone, then send it automatically.
  const toggleListening = () => {
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Please type your message.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    // start() can throw synchronously (already running / permission blocked); only
    // mark as listening on success so the mic button can't get stuck on "●".
    try {
      recognition.start();
      setListening(true);
    } catch (_) {
      setListening(false);
      recognitionRef.current = null;
      alert("Could not start the microphone. Please type your message.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={{ color: "#fff" }}>Please log in to use Emergency Chat</h2>
          <Link to="/Log-in" style={styles.link}>
            Go to Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Saheli — Emergency Chat</div>
            <div style={styles.subtitle}>A calm companion. Not a substitute for emergency services — call 112.</div>
          </div>
          <button
            type="button"
            onClick={() => setSpeakReplies((v) => !v)}
            style={{ ...styles.iconBtn, opacity: speakReplies ? 1 : 0.55 }}
            title={speakReplies ? "Voice replies on" : "Voice replies off"}
          >
            {speakReplies ? "🔊" : "🔈"}
          </button>
        </div>

        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.userBubble : styles.botBubble),
              }}
            >
              {m.content}
            </div>
          ))}
          {loading && <div style={{ ...styles.bubble, ...styles.botBubble }}>…</div>}
          <div ref={endRef} />
        </div>

        <div style={styles.quickRow}>
          <button type="button" style={styles.quickBtn} onClick={() => sendMessage("Help me stay calm")}>
            Help me stay calm
          </button>
          <Link to="/Share-Location" style={styles.quickBtn}>
            Share my location
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={styles.inputRow}>
          <button
            type="button"
            onClick={toggleListening}
            style={{ ...styles.iconBtn, color: listening ? "#ff5d5d" : "#fff" }}
            title="Speak"
          >
            {listening ? "●" : "🎤"}
          </button>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening…" : "Type how you feel…"}
          />
          <button type="submit" style={styles.sendBtn} disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f1020",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#1b1c33",
    borderRadius: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: "#272a4d",
  },
  title: { color: "#fff", fontWeight: 700, fontSize: 16 },
  subtitle: { color: "#b9bbe0", fontSize: 11, marginTop: 2 },
  messages: {
    padding: 16,
    height: 380,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 14,
    maxWidth: "80%",
    fontSize: 14,
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
  },
  botBubble: { background: "#2f3257", color: "#eef0ff", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  userBubble: { background: "#5b6bf5", color: "#fff", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  quickRow: { display: "flex", gap: 8, padding: "0 16px 10px" },
  quickBtn: {
    flex: 1,
    textAlign: "center",
    background: "#2f3257",
    color: "#cdd0ff",
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 12,
    cursor: "pointer",
    textDecoration: "none",
  },
  inputRow: { display: "flex", alignItems: "center", gap: 8, padding: 12, background: "#15162b" },
  input: {
    flex: 1,
    border: "none",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    background: "#272a4d",
    color: "#fff",
  },
  iconBtn: { background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#fff" },
  sendBtn: {
    background: "#5b6bf5",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  link: { color: "#9fb0ff", display: "inline-block", marginTop: 12 },
};
