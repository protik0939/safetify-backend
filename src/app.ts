import express, { Application, Request, Response } from 'express';
import { IndexRouters } from './app/routes';
import { AuthRoutes } from './app/module/auth/auth.route';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth';
import { NextFunction } from "express";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

// Custom auth routes (register, login, session) — scoped body parser
// Falls through to toNodeHandler if no route matches
app.use('/api/v1/auth', express.json(), AuthRoutes);

// better-auth catch-all for social OAuth, sign-out, callback, etc.
// *splat = Express v5 named wildcard (per better-auth docs)
app.all("/api/v1/auth/*splat", toNodeHandler(auth));

// Global body parser for all other routes (AFTER toNodeHandler)
app.use(express.json());

// All other routes
app.use('/api/v1/', IndexRouters);

app.get('/', (req: Request, res: Response) => {
  res.send('Safetify!');
});

// Global error handler
app.use(
  (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("Unhandled error:", err);

    res.status(
      (err as { statusCode?: number })?.statusCode || 500
    ).json({
      success: false,
      message:
        (err as { message?: string })?.message ||
        "Internal server error",
    });
  }
);

export default app;
