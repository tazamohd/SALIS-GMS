import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { db } from "./db";
import { garages } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

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
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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

      // User properties available for enrichment

      // Enrich user with subscription plan from garage (Drizzle returns camelCase)
      let subscriptionPlan = 'STARTER';
      const garageId = (user as any).garageId;
      if (garageId) {
        try {
          const [garage] = await db.select().from(garages).where(eq(garages.id, garageId));
          // Garage subscription plan resolved
          if (garage && (garage as any).subscriptionPlan) {
            subscriptionPlan = (garage as any).subscriptionPlan;
          }
        } catch (garageError) {
          console.error('Error fetching garage for subscription plan:', garageError);
        }
      }

      const enrichedUser = { ...user, subscriptionPlan };
      done(null, enrichedUser);
    } catch (error) {
      done(null, false);
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function invalidateUserSessions(userId: string): Promise<void> {
  try {
    const { pool } = await import('./db');
    await pool.query(
      `DELETE FROM sessions WHERE sess::jsonb -> 'passport' ->> 'user' = $1`,
      [userId]
    );
  } catch (error) {
    console.error('Error invalidating sessions:', error);
  }
}
