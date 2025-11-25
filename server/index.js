// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@clerk/clerk-sdk-node"; // Clerk server SDK

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Vite default port
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PORT = process.env.PORT || 5000;

// Middleware: verify Clerk token from Authorization header
async function verifyClerkUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No authorization header" });
    const token = authHeader.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "Malformed authorization header" });

    // verifyToken should return decoded token containing sub or userId
    // If your Clerk SDK uses a different function name, please check Clerk docs.
    const decoded = await verifyToken({ token, apiKey: process.env.CLERK_SECRET_KEY });
    // decoded.sub is the user id in many JWT conventions; check your decoded object
    const userId = decoded?.sub || decoded?.userId || decoded?.uid;
    if (!userId) return res.status(401).json({ error: "Invalid token" });

    req.userId = userId;
    next();
  } catch (err) {
    console.error("Clerk verify error:", err);
    return res.status(401).json({ error: "Unauthorized - token invalid or expired" });
  }
}

/* --- Routes --- */

// Save new history
app.post("/api/histories", verifyClerkUser, async (req, res) => {
  const { title, prompt, framework, code, metadata } = req.body;
  if (!code) return res.status(400).json({ error: "No code to save" });
  // Basic server-side size check
  if (code.length > 200 * 1024) return res.status(400).json({ error: "Code too large" });

  const payload = {
    clerk_user_id: req.userId,
    title: title || (prompt ? prompt.slice(0, 80) : "Untitled"),
    prompt,
    framework,
    code,
    metadata: metadata || {},
  };

  const { data, error } = await supabase.from("histories").insert([payload]).select().single();

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ ok: true, row: data });
});

// List histories (brief fields)
app.get("/api/histories", verifyClerkUser, async (req, res) => {
  const { page = 1, per_page = 20 } = req.query;
  const offset = (page - 1) * per_page;

  const { data, error } = await supabase
    .from("histories")
    .select("id, title, framework, metadata, created_at")
    .eq("clerk_user_id", req.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ items: data });
});

// Get single history (full)
app.get("/api/histories/:id", verifyClerkUser, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("histories")
    .select("*")
    .eq("id", id)
    .eq("clerk_user_id", req.userId)
    .single();

  if (error) return res.status(404).json({ error: "Not found or not yours" });
  res.json(data);
});

// Delete
app.delete("/api/histories/:id", verifyClerkUser, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from("histories")
    .delete()
    .eq("id", id)
    .eq("clerk_user_id", req.userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
