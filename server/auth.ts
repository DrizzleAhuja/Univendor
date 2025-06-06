import session from "express-session";
import connectPg from "connect-pg-simple";
import nodemailer from "nodemailer";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import cors from "cors";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'univendor.sid',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
    },
  });
}

export function setupAuth(app: Express) {
  // Trust first proxy for secure cookies in production
  app.set("trust proxy", 1);
  
  // Set up CORS before session middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Set up session
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = req.session as any;
  const userId = session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Handle impersonation
    let effectiveUser = user;
    let isImpersonating = false;
    
    if (session.impersonatedUserId && session.originalUserId) {
      // Check if the original user has admin privileges
      const originalUser = await storage.getUser(session.originalUserId);
      if (originalUser && (originalUser.role === 'super_admin' || originalUser.role === 'admin')) {
        const impersonatedUser = await storage.getUser(session.impersonatedUserId);
        if (impersonatedUser) {
          effectiveUser = impersonatedUser;
          isImpersonating = true;
        }
      }
    }
    
    // Structure the user object to match expected format
    (req as any).user = {
      claims: {
        sub: effectiveUser.id.toString(),
        email: effectiveUser.email,
        role: effectiveUser.role
      },
      userData: effectiveUser,
      originalUser: isImpersonating ? user : null,
      isImpersonating
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Email service for sending OTP
export class EmailService {
  private transporter;

  constructor() {
    console.log("Initializing Email Service with Gmail...");
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'drizzle003.ace@gmail.com',
        pass: 'ookf kaqm bznp ievm'
      },
      tls: {
        // Required for Gmail
        rejectUnauthorized: true
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
      } else {
        console.log('SMTP Connection Success:', success);
      }
    });
  }

  async sendOTP(email: string, code: string): Promise<boolean> {
    console.log(`Attempting to send OTP to ${email}`);

    try {
      const mailOptions = {
        from: {
          name: 'UnivendorPro',
          address: 'drizzle003.ace@gmail.com'
        },
        to: email,
        subject: "Your UnivendorPro Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Verification Code</h2>
            <p>Please use the following code to verify your email address:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      };

      console.log('Sending email with options:', { ...mailOptions, auth: '[REDACTED]' });

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      return true;
    } catch (error) {
      console.error('Detailed email sending error:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }
}

export const emailService = new EmailService();

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}