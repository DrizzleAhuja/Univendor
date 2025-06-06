import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log session info for debugging
    console.log('Session data:', {
      session: req.session,
      userId: req.session?.userId,
    });

    // First check if we already have user data from a previous middleware
    if ((req as any).user?.claims?.sub) {
      return next();
    }

    // Then check session
    if (!req.session?.userId) {
      console.error('No userId in session');
      return res.status(401).json({ error: 'No user ID in session' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, parseInt(req.session.userId)));

    if (!user) {
      console.error(`User not found for ID: ${req.session.userId}`);
      return res.status(401).json({ error: 'User not found' });
    }

    // Set up the user object in the format expected by the application
    (req as any).user = {
      claims: {
        sub: user.id.toString(),
        email: user.email,
        role: user.role
      },
      userData: user
    };

    // Log the user object we're setting up
    console.log('Setting up user object:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}; 