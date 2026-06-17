import express, { Application, Request, Response, NextFunction } from 'express';
import { IndexRouters } from './app/routes';
import { AuthRoutes } from './app/module/auth/auth.route';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth';

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

// Custom auth routes (register, login, session) — scoped body parser, falls through if no match
app.use('/api/v1/auth', express.json(), AuthRoutes);

// better-auth catch-all for social OAuth, sign-out, callback, etc.
// Uses app.all (not app.use) so req.url keeps the full path including /api/v1/auth/...
app.all("/api/v1/auth/{*any}", toNodeHandler(auth));

// Global body parser for all other routes
app.use(express.json());

// All other routes
app.use('/api/v1/', IndexRouters);

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
