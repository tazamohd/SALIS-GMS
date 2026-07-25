import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import { db } from "./db";
import { garages } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

export function validateSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: SESSION_SECRET is not set. Refusing to start in production without a session secret.'
      );
    }
    console.warn(
      '[SECURITY WARNING] SESSION_SECRET is not set. Using a development-only fallback. ' +
      'Sessions will be insecure. Set SESSION_SECRET in .env before production deployment.'
    );
    return 'dev-only-insecure-secret-do-not-use-in-production';
  }
  if (secret.length < 32) {
    throw new Error(
      'FATAL: SESSION_SECRET must be at least 32 characters long. ' +
      `Current length: ${secret.length}. Generate a secure secret with: openssl rand -hex 32`
    );
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  const validatedSecret = validateSessionSecret();
  return session({
    secret: validatedSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await comparePassword(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          if (!user.isActive) {
            return done(null, false, { message: "Account is inactive" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Debug log to verify user properties
      console.log('deserializeUser - user garageId:', (user as any).garageId, 'role:', (user as any).role);
      
      // Enrich user with subscription plan from garage (Drizzle returns camelCase)
      let subscriptionPlan = 'STARTER';
      const garageId = (user as any).garageId;
      if (garageId) {
        try {
          const [garage] = await db.select().from(garages).where(eq(garages.id, garageId));
          console.log('deserializeUser - garage found:', garage ? 'yes' : 'no', 'subscriptionPlan:', (garage as any)?.subscriptionPlan);
          if (garage && (garage as any).subscriptionPlan) {
            subscriptionPlan = (garage as any).subscriptionPlan;
          }
        } catch (garageError) {
          console.error('Error fetching garage for subscription plan:', garageError);
        }
      }
      
      const enrichedUser = { ...user, subscriptionPlan };
      // Redact sensitive fields before placing in session/req.user
      const { password: _password, passwordHash: _passwordHash, ...safeUser } = enrichedUser as any;
      console.log('deserializeUser - enriched subscriptionPlan:', subscriptionPlan);
      done(null, safeUser);
    } catch (error) {
      done(null, false);
    }
  });
}

// Feature flag for auth bypass during development
const AUTH_BYPASS_ENABLED = process.env.AUTH_BYPASS === 'true';

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Development bypass - disabled by default for security
  if (AUTH_BYPASS_ENABLED) {
    console.warn('Auth bypass enabled - development only');
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
};
