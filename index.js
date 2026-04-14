// index.js - Full VPS Server (Bot + Pairing API + Frontend) with AKASH XMD MINI theme
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import initializeTelegramBot from "./bot.js";
import { forceLoadPlugins } from "./lib/plugins.js";
import eventlogger from "./lib/handier.js";
import { manager, main, db } from "./lib/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

// ensure sessions dir exists
const SESSIONS_DIR = path.join(process.cwd(), "sessions");
await fs.mkdirp(SESSIONS_DIR);

// Utility: format pairing code in groups of 4 (AAAA-BBBB-CCCC)
function fmtCode(raw) {
  if (!raw) return raw;
  const s = String(raw).replace(/\s+/g, "");
  return s.match(/.{1,4}/g)?.join("-") || s;
}

async function waitForOpen(sock, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      sock.ev.off("connection.update", handler);
      reject(new Error("Timed out waiting for connection to open"));
    }, timeoutMs);
    const handler = (update) => {
      const { connection, lastDisconnect } = update || {};
      if (connection === "open") {
        clearTimeout(timeout);
        sock.ev.off("connection.update", handler);
        resolve();
      } else if (connection === "close") {
        clearTimeout(timeout);
        sock.ev.off("connection.update", handler);
        const err = lastDisconnect?.error || new Error("Connection closed before open");
        reject(err);
      }
    };
    sock.ev.on("connection.update", handler);
  });
}

// ========== 1. SERVE STYLISH FRONTEND (AKASH XMD MINI - PROFESSIONAL) ==========
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>AKASH XMD MINI | WhatsApp Pairing</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: radial-gradient(circle at 20% 30%, #0a0f1e, #03060c);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            position: relative;
            overflow-x: hidden;
        }

        /* Animated background orbs */
        .orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.4;
            z-index: 0;
            animation: float 20s infinite alternate ease-in-out;
        }
        .orb-1 { width: 40vw; height: 40vw; background: #ff3366; top: -10vh; left: -10vw; }
        .orb-2 { width: 50vw; height: 50vw; background: #00d4ff; bottom: -20vh; right: -15vw; animation-duration: 25s; }
        .orb-3 { width: 30vw; height: 30vw; background: #9b59b6; top: 40%; left: 30%; animation-duration: 18s; opacity: 0.3; }
        @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(5%, 5%) scale(1.1); }
        }

        /* Main card */
        .card {
            position: relative;
            z-index: 2;
            max-width: 560px;
            width: 100%;
            background: rgba(12, 18, 28, 0.65);
            backdrop-filter: blur(16px);
            border-radius: 3rem;
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
            padding: 2.2rem 2rem;
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-6px);
        }

        /* Header */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 51, 102, 0.15);
            padding: 0.4rem 1rem;
            border-radius: 100px;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(255, 51, 102, 0.3);
        }
        .badge i {
            font-size: 0.9rem;
            color: #ff3366;
        }
        .badge span {
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            color: #ff99bb;
        }
        h1 {
            font-size: 2.8rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff, #ff99bb, #00d4ff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
        }
        .sub {
            color: #8e9aaf;
            margin-bottom: 2rem;
            font-size: 0.95rem;
            border-left: 3px solid #ff3366;
            padding-left: 0.75rem;
        }

        /* Input group */
        .input-group {
            margin-bottom: 1.5rem;
        }
        .input-label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #ccd6f0;
            letter-spacing: 0.3px;
        }
        .input-label i {
            margin-right: 0.5rem;
            color: #ff3366;
        }
        .phone-wrapper {
            display: flex;
            align-items: center;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            transition: all 0.2s ease;
        }
        .phone-wrapper:focus-within {
            border-color: #ff3366;
            box-shadow: 0 0 12px rgba(255, 51, 102, 0.3);
        }
        .country-code {
            padding: 1rem 0 1rem 1.5rem;
            color: #ff3366;
            font-weight: 600;
        }
        .phone-wrapper input {
            flex: 1;
            background: transparent;
            border: none;
            padding: 1rem 1rem 1rem 0.5rem;
            color: white;
            font-size: 1rem;
            font-weight: 500;
            outline: none;
        }
        .phone-wrapper input::placeholder {
            color: #5a6782;
            font-weight: 400;
        }
        .hint {
            font-size: 0.7rem;
            color: #6c7a96;
            margin-top: 0.5rem;
            margin-left: 0.5rem;
        }

        /* CTA Button */
        .btn-primary {
            width: 100%;
            background: linear-gradient(90deg, #ff3366, #ff6b6b);
            border: none;
            padding: 1rem;
            border-radius: 2rem;
            font-weight: 700;
            font-size: 1.1rem;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 1.8rem;
            position: relative;
            overflow: hidden;
        }
        .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        .btn-primary:hover::before {
            left: 100%;
        }
        .btn-primary:hover {
            transform: scale(1.02);
            box-shadow: 0 10px 20px -5px rgba(255, 51, 102, 0.5);
        }
        .btn-primary:disabled {
            opacity: 0.6;
            transform: none;
            cursor: not-allowed;
        }

        /* Loader */
        .loader {
            display: none;
            justify-content: center;
            margin: 1rem 0;
        }
        .spinner {
            width: 42px;
            height: 42px;
            border: 3px solid rgba(255,51,102,0.2);
            border-top: 3px solid #ff3366;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Result card */
        .result-card {
            background: rgba(0, 0, 0, 0.55);
            border-radius: 1.8rem;
            padding: 1.5rem;
            margin-top: 1rem;
            border: 1px solid rgba(255,51,102,0.3);
            backdrop-filter: blur(4px);
            display: none;
            animation: fadeUp 0.4s ease;
        }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .code-header {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: 1rem;
        }
        .code-header i {
            font-size: 1.5rem;
            color: #ff3366;
        }
        .code-header h3 {
            font-size: 1.2rem;
            font-weight: 600;
        }
        .code-display {
            background: #000000aa;
            border-radius: 1.2rem;
            padding: 1.2rem;
            font-family: 'Monaco', monospace;
            font-size: 2rem;
            font-weight: 800;
            text-align: center;
            letter-spacing: 8px;
            color: #ff99bb;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: 0.2s;
            border: 1px dashed #ff3366;
        }
        .code-display:hover {
            background: #ff336620;
            letter-spacing: 10px;
        }
        .steps {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            margin: 1rem 0;
        }
        .step {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            font-size: 0.85rem;
            color: #b9c3db;
        }
        .step-num {
            width: 24px;
            height: 24px;
            background: rgba(255,51,102,0.2);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: bold;
            color: #ff99bb;
        }
        .timer {
            text-align: center;
            margin-top: 1rem;
            font-size: 0.8rem;
            color: #ffcc66;
        }
        .timer i {
            margin-right: 0.3rem;
        }
        .error-msg {
            color: #ff8888;
            background: rgba(255,0,0,0.1);
            border-radius: 1rem;
            padding: 0.8rem;
            text-align: center;
            font-size: 0.9rem;
        }

        footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.7rem;
            color: #5a6e8c;
        }
        footer a {
            color: #ff99bb;
            text-decoration: none;
        }
        @media (max-width: 480px) {
            .card { padding: 1.5rem; }
            h1 { font-size: 2rem; }
            .code-display { font-size: 1.5rem; letter-spacing: 4px; }
        }
    </style>
</head>
<body>
<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<div class="card">
    <div class="badge">
        <i class="fas fa-bolt"></i>
        <span>READY TO PAIR</span>
    </div>
    <h1>AKASH XMD MINI</h1>
    <div class="sub">
        <i class="fas fa-infinity"></i> Instant pairing • 24/7 online • Seamless
    </div>

    <div class="input-group">
        <label class="input-label"><i class="fab fa-whatsapp"></i> WhatsApp Number</label>
        <div class="phone-wrapper">
            <span class="country-code">+</span>
            <input type="tel" id="phoneNumber" placeholder="91XXXXXXXXXX" autocomplete="off">
        </div>
        <div class="hint"><i class="fas fa-globe"></i> Include country code without '+'</div>
    </div>

    <button class="btn-primary" id="pairBtn">
        <span>CONNECT DEVICE</span>
        <i class="fas fa-arrow-right"></i>
    </button>

    <div class="loader" id="loader">
        <div class="spinner"></div>
    </div>

    <div class="result-card" id="resultCard">
        <div class="code-header">
            <i class="fas fa-key"></i>
            <h3>Pairing Code Generated</h3>
        </div>
        <div class="code-display" id="pairingCode">------</div>
        <div class="steps">
            <div class="step"><span class="step-num">1</span> Open WhatsApp → Settings / Linked Devices</div>
            <div class="step"><span class="step-num">2</span> Tap "Link with phone number"</div>
            <div class="step"><span class="step-num">3</span> Enter the code above</div>
        </div>
        <div class="timer" id="timerArea"><i class="fas fa-hourglass-half"></i> <span id="timerText">05:00</span> remaining</div>
        <p style="font-size:0.7rem; text-align:center; margin-top:0.8rem;">Tap code to copy 📋</p>
    </div>

    <footer>
        ⚡ Powered by AKASH XMD • <i class="fas fa-shield-alt"></i> Secure Pairing
    </footer>
</div>

<script>
    // DOM elements
    const phoneInput = document.getElementById('phoneNumber');
    const pairBtn = document.getElementById('pairBtn');
    const loaderDiv = document.getElementById('loader');
    const resultCard = document.getElementById('resultCard');
    const pairingCodeSpan = document.getElementById('pairingCode');
    const timerTextSpan = document.getElementById('timerText');

    let countdownInterval = null;

    // Auto format: only digits
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\\D/g, '');
    });

    // Copy functionality
    pairingCodeSpan.addEventListener('click', async () => {
        const code = pairingCodeSpan.innerText;
        if (code && code !== '------') {
            try {
                await navigator.clipboard.writeText(code);
                const original = pairingCodeSpan.innerText;
                pairingCodeSpan.innerText = '✓ COPIED!';
                pairingCodeSpan.style.letterSpacing = 'normal';
                setTimeout(() => {
                    pairingCodeSpan.innerText = original;
                    pairingCodeSpan.style.letterSpacing = '8px';
                }, 1500);
            } catch (err) {
                alert('Tap and copy manually');
            }
        }
    });

    function startTimer(seconds = 300) {
        if (countdownInterval) clearInterval(countdownInterval);
        let remaining = seconds;
        const updateTimer = () => {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            timerTextSpan.innerText = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
            if (remaining <= 0) {
                clearInterval(countdownInterval);
                timerTextSpan.innerText = 'Expired';
                timerTextSpan.style.color = '#ff8888';
            }
            remaining--;
        };
        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    }

    pairBtn.addEventListener('click', async () => {
        let rawNumber = phoneInput.value.trim();
        if (!rawNumber) {
            alert('Please enter your WhatsApp number');
            return;
        }
        if (rawNumber.length < 8) {
            alert('Enter a valid number (min 8 digits)');
            return;
        }
        // Add + prefix
        const fullNumber = '+' + rawNumber;

        pairBtn.disabled = true;
        loaderDiv.style.display = 'flex';
        resultCard.style.display = 'none';
        if (countdownInterval) clearInterval(countdownInterval);

        try {
            const res = await fetch('/api/reqpair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: fullNumber })
            });
            const data = await res.json();
            if (data.success && data.pairingCode) {
                pairingCodeSpan.innerText = data.pairingCode;
                resultCard.style.display = 'block';
                startTimer(300);
                // auto scroll to result
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                alert(data.message || 'Pairing failed, try again');
                resultCard.style.display = 'none';
            }
        } catch (err) {
            console.error(err);
            alert('Server error: ' + err.message);
            resultCard.style.display = 'none';
        } finally {
            pairBtn.disabled = false;
            loaderDiv.style.display = 'none';
        }
    });

    // Enter key support
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') pairBtn.click();
    });
</script>
</body>
</html>
  `);
});

// ========== 2. PAIRING API PROXY ==========
app.post('/api/reqpair', async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ success: false, message: 'Number required' });
    
    let cleanNum = number.replace(/[^0-9]/g, '');
    if (!cleanNum) return res.status(400).json({ success: false, message: 'Invalid number' });
    
    try {
        const botUrl = `http://localhost:${process.env.PORT || 3000}/pair/${cleanNum}/`;
        const response = await fetch(botUrl);
        const data = await response.json();
        
        if (data.ok && data.code) {
            return res.json({ success: true, pairingCode: data.code });
        } else {
            return res.status(500).json({ success: false, message: data.error || 'Bot pairing failed' });
        }
    } catch (err) {
        console.error('Pairing proxy error:', err);
        return res.status(500).json({ success: false, message: 'Bot not reachable' });
    }
});

// ========== 3. ORIGINAL BOT ROUTES ==========
// Start a session
app.get("/start/:sessionId", async (req, res) => {
  const sid = req.params.sessionId;
  try {
    const sock = await manager.start(sid);
    res.json({ ok: true, sessionId: sid, running: manager.isRunning(sid) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// Pairing route (already exists, but we keep it for direct access)
app.get("/pair/:num/", async (req, res) => {
  const sid = req.params.num;
  const phone = sid;
  if (!/^[0-9]{6,15}$/.test(phone)) {
    return res.status(400).json({ ok: false, error: "phone must be digits (E.164 without +), e.g. 919812345678" });
  }
  const cleanNumber = String(phone || "").replace(/[^0-9]/g, "");
  try {
    const sock = await manager.start(cleanNumber);
    if (!sock) throw new Error("Failed to create socket");
    try { await waitForOpen(sock, 20000); } catch (waitErr) { console.warn(`⚠️ [${sid}] waitForOpen warning: ${waitErr.message}`); }
    if (!sock.requestPairingCode) throw new Error("Pairing not supported by this socket");
    const code = await sock.requestPairingCode(cleanNumber);
    return res.json({ ok: true, sessionId: sid, cleanNumber, code });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// Stop session
app.post("/stop/:sessionId", async (req, res) => {
  const sid = req.params.sessionId;
  try {
    const ok = await manager.stop(sid);
    res.json({ ok, sessionId: sid });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// Logout (permanent)
app.post("/logout/:sessionId", async (req, res) => {
  const sid = req.params.sessionId;
  try {
    const ok = await manager.logout(sid);
    res.json({ ok, sessionId: sid });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// List sessions
app.get("/sessions", (req, res) => {
  res.json({ sessions: manager.list() });
});

// ========== 4. STARTUP LOGIC (same as original) ==========
process.on("SIGINT", async () => {
  await db.flush();
  await db.close();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;

(async function init() {
  try {
    await main({ autoStartAll: false });
    app.listen(PORT, '0.0.0.0', async () => {
      console.log(`✅ AKASH XMD MINI fully running on port ${PORT}`);
      console.log(`🌐 Public URL: http://<your-vps-ip>:${PORT}`);
      console.log(`🔗 Pairing API: POST http://<your-vps-ip>:${PORT}/api/reqpair`);
      try {
        await manager.startAll();
        await db.ready();
        console.log("Attempted to start registered sessions");
      } catch (e) { console.warn("startAll err", e?.message || e); }
      try {
        await forceLoadPlugins();
        console.log("🔌 Plugins loaded (startup).");
      } catch (err) { console.error("Failed to preload plugins:", err?.message || err); }
      try {
        initializeTelegramBot(manager);
      } catch (e) { console.warn("bot err", e?.message || e); }
    });
  } catch (err) {
    console.error("Initialization error", err);
    process.exit(1);
  }
})();
