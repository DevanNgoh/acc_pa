// Serverless proxy: keeps your Anthropic API key off the phone.
// Deploy with Vercel. Set env var ANTHROPIC_API_KEY (and optionally CLAUDE_MODEL).
const SYSTEM = "You are a warm, encouraging accountability partner inside a habit app. Be supportive and friendly, with gentle nudges rather than pressure. Never shame or lecture. Reply in 2 to 6 short sentences, plain text, no markdown. Treat slips on long-term journeys such as addiction recovery as part of the process: never judge, remind them progress isn't erased, and encourage reaching out to a trusted person, counselor or doctor. Never give medical, detox or dosing advice; for alcohol or medication withdrawal, tell them to talk to a doctor. If someone mentions suicide, self-harm or being in danger, respond with care and urge them to call or text 988 in the US, or local emergency services, right away. Stay on the topic of goals, habits, wellbeing and encouragement.";
const hits = new Map();

module.exports = async (req, res) => {
  // ALLOWED_ORIGINS: comma-separated list, e.g. https://USERNAME.github.io,capacitor://localhost,https://localhost
  // Leave unset to allow any origin (fine while testing).
  const allowed = (process.env.ALLOWED_ORIGINS || "*").split(",").map((o) => o.trim());
  const origin = req.headers.origin || "";
  if (allowed.includes("*")) res.setHeader("Access-Control-Allow-Origin", "*");
  else if (allowed.includes(origin)) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary", "Origin"); }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method" });

  // Best-effort rate limit (per serverless instance). Use Upstash/Redis for a real one.
  const ip = String(req.headers["x-forwarded-for"] || "x").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (recent.length >= 12) return res.status(429).json({ error: "rate_limited" });
  recent.push(now);
  hits.set(ip, recent);

  const prompt = String((req.body && req.body.prompt) || "").slice(0, 6000);
  if (!prompt) return res.status(400).json({ error: "empty" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) return res.status(502).json({ error: "upstream" });
    const d = await r.json();
    const text = (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: "upstream" });
  }
};
