import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { userRepository, profileRepository } from "../repositories";
import { AuthTokenPayload, AuthResponse, UserPublic } from "../types";

const TOKEN_EXPIRY = "7d";

const generateToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
};

const formatUserPublic = (user: {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: Date;
}): UserPublic => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  role: user.role as UserPublic["role"],
  createdAt: user.created_at,
});

/**
 * Handle OAuth user — find or create, then return auth response.
 * Security: Only auto-links to an existing email account if the OAuth provider
 * verified the email (emailVerified=true). Otherwise creates a new account.
 */
const handleOAuthUser = async (
  provider: string,
  oauthId: string,
  email: string,
  fullName: string,
  emailVerified: boolean = false
): Promise<AuthResponse> => {
  // 1. Check if user already exists with this OAuth provider + ID
  let existingUser = await userRepository.findByOAuth(provider, oauthId);

  if (!existingUser) {
    // 2. Check if user exists with this email — only link if email is verified by provider
    if (emailVerified) {
      existingUser = await userRepository.findByEmail(email);
    }

    if (existingUser) {
      // Link OAuth to existing account (safe — email verified by provider)
      await userRepository.linkOAuth(existingUser.id, provider, oauthId);
    } else {
      // 3. Create new user (developers by default via OAuth)
      existingUser = await userRepository.createOAuth(
        email,
        fullName,
        "developer",
        provider,
        oauthId
      );

      // Auto-create developer profile
      await profileRepository.createForUser(existingUser.id);
    }
  }

  const tokenPayload: AuthTokenPayload = {
    userId: existingUser.id,
    email: existingUser.email,
    role: existingUser.role,
  };

  const token = generateToken(tokenPayload);
  const userPublic = formatUserPublic(existingUser);

  return { token, user: userPublic };
};

// ─── Configure Passport Strategies ───
export const configurePassport = (): void => {
  // Serialize/Deserialize (not used for JWT, but passport requires it)
  passport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
  });

  // ─── GitHub Strategy ───
  if (config.githubClientId && config.githubClientSecret) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: config.githubClientId,
          clientSecret: config.githubClientSecret,
          callbackURL: `${config.backendUrl}/api/auth/github/callback`,
          scope: ["user:email"],
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: { id: string; displayName?: string; emails?: Array<{ value: string; verified?: boolean }> },
          done: (error: Error | null, user?: AuthResponse) => void
        ) => {
          try {
            const emailEntry = profile.emails?.[0];
            const email = emailEntry?.value || `github_${profile.id}@oauth.local`;
            const emailVerified = emailEntry?.verified === true;
            const fullName = profile.displayName || `GitHub User ${profile.id}`;
            const authResponse = await handleOAuthUser(
              "github",
              profile.id,
              email,
              fullName,
              emailVerified
            );
            done(null, authResponse);
          } catch (error) {
            done(error as Error);
          }
        }
      )
    );
    console.log("  ✓ GitHub OAuth configured");
  } else {
    console.log("  ⚠ GitHub OAuth not configured (missing credentials)");
  }

  // ─── Google Strategy ───
  if (config.googleClientId && config.googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.googleClientId,
          clientSecret: config.googleClientSecret,
          callbackURL: `${config.backendUrl}/api/auth/google/callback`,
          scope: ["profile", "email"],
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: { id: string; displayName?: string; emails?: Array<{ value: string; verified?: boolean }> },
          done: (error: Error | null, user?: AuthResponse) => void
        ) => {
          try {
            const emailEntry = profile.emails?.[0];
            const email = emailEntry?.value || `google_${profile.id}@oauth.local`;
            // Google typically verifies emails
            const emailVerified = emailEntry?.verified !== false;
            const fullName = profile.displayName || `Google User ${profile.id}`;
            const authResponse = await handleOAuthUser(
              "google",
              profile.id,
              email,
              fullName,
              emailVerified
            );
            done(null, authResponse);
          } catch (error) {
            done(error as Error);
          }
        }
      )
    );
    console.log("  ✓ Google OAuth configured");
  } else {
    console.log("  ⚠ Google OAuth not configured (missing credentials)");
  }
};

export { passport };
