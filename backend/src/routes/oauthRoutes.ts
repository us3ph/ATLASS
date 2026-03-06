import { Router, Request, Response } from "express";
import crypto from "crypto";
import { passport } from "../services/oauthService";
import { config } from "../config";
import { AuthResponse } from "../types";

const router = Router();

// ─── Temporary code store (short-lived, single-use) ───
const oauthCodeStore = new Map<string, { authResponse: AuthResponse; expiresAt: number }>();

// Cleanup expired codes every 60s
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of oauthCodeStore) {
    if (entry.expiresAt < now) oauthCodeStore.delete(code);
  }
}, 60_000);

// POST /api/auth/exchange — exchange a one-time code for token + user
router.post("/exchange", (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code || typeof code !== "string") {
    res.status(400).json({ success: false, message: "Missing authorization code" });
    return;
  }

  const entry = oauthCodeStore.get(code);
  if (!entry || entry.expiresAt < Date.now()) {
    oauthCodeStore.delete(code);
    res.status(400).json({ success: false, message: "Invalid or expired authorization code" });
    return;
  }

  oauthCodeStore.delete(code); // single-use
  res.json({ success: true, data: entry.authResponse });
});

// ══════════════════════════════════════
// GitHub OAuth
// ══════════════════════════════════════

// GET /api/auth/github — Redirect to GitHub login
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

// GET /api/auth/github/callback — GitHub redirects back here
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${config.corsOrigin}/login?error=github_auth_failed`,
    session: false,
  }),
  (req: Request, res: Response) => {
    const authResponse = req.user as unknown as AuthResponse;
    const code = crypto.randomBytes(32).toString("hex");
    oauthCodeStore.set(code, { authResponse, expiresAt: Date.now() + 60_000 }); // 60s TTL

    // Redirect to frontend with short-lived code (NOT the token)
    res.redirect(
      `${config.corsOrigin}/oauth/callback?code=${code}`
    );
  }
);

// ══════════════════════════════════════
// Google OAuth
// ══════════════════════════════════════

// GET /api/auth/google — Redirect to Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// GET /api/auth/google/callback — Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.corsOrigin}/login?error=google_auth_failed`,
    session: false,
  }),
  (req: Request, res: Response) => {
    const authResponse = req.user as unknown as AuthResponse;
    const code = crypto.randomBytes(32).toString("hex");
    oauthCodeStore.set(code, { authResponse, expiresAt: Date.now() + 60_000 }); // 60s TTL

    // Redirect to frontend with short-lived code (NOT the token)
    res.redirect(
      `${config.corsOrigin}/oauth/callback?code=${code}`
    );
  }
);

export default router;
