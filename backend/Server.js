require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const connectiona = require("./Connect");
const USerRouter = require("./Router/User-Register");
const USerDetailRouter = require("./Router/User-Detail");
const LoginRouter = require("./Router/User-Login");
const LocationRouter = require("./Router/Location-route");
const ChatRouter = require("./Router/Chat-route");
const registerSocket = require("./socket");

const app = express();

// Allowed frontend origins. Comma-separated CLIENT_URLS env overrides defaults.
const allowedOrigins = (
  process.env.CLIENT_URLS ||
  "http://localhost:3000,https://secure-steps-djqj.vercel.app"
)
  .split(",")
  .map((o) => o.trim().replace(/\/$/, "")) // strip trailing slashes — origins never have one
  .filter(Boolean);

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    // Allow non-browser tools (no Origin header) and any whitelisted origin.
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser(process.env.JWT_SECRET));

app.get("/", (req, res) => res.json({ status: "ok", service: "SecureSteps API" }));

app.use("/user", USerRouter);
app.use("/user", USerDetailRouter);
app.use("/user", LoginRouter);
app.use("/user", LocationRouter);
app.use("/user", ChatRouter);

const server = http.createServer(app);

// Realtime location sharing runs on the same HTTP server / port.
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
});
registerSocket(io);
app.set("io", io);

const PORT = process.env.PORT || 1042;

connectiona().then(() => {
  server.listen(PORT, () => {
    console.log(`Server (REST + Socket.IO) listening on port ${PORT}`);
  });
});
