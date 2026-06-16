import express, { Application, Request, Response, NextFunction } from 'express';
import { IndexRouters } from './app/routes';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth';

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Custom auth routes (register, login, session) — must come first
app.use('/api/v1/', IndexRouters);

// better-auth catch-all for everything else (social OAuth, sign-out, etc.)
// Mounted AFTER custom routes so /register and /login take precedence
app.use('/api/v1/auth', toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err?.statusCode || 500).json({
    success: false,
    message: err?.message || "Internal server error",
  });
});

export default app;