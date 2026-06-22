import express, { Application, Request, Response } from 'express';
import { IndexRouters } from './app/routes';
import { AuthRoutes } from './app/module/auth/auth.route';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth';
import { NextFunction } from "express";

const app: Application = express();

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes("localhost") || origin.includes("ngrok-free.dev") || origin.startsWith("safetify://"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Deep link redirect interceptor middleware to append session token
app.use((req, res, next) => {
  const originalWriteHead = res.writeHead;
  res.writeHead = function (statusCode: any, ...args: any[]) {
    const currentStatus = statusCode || res.statusCode;
    if (currentStatus === 302 || currentStatus === 307) {
      let location = res.getHeader('location') || '';
      if (typeof location === 'string' && location.startsWith('safetify://')) {
        const setCookie = res.getHeader('set-cookie');
        if (setCookie) {
          const cookies = Array.isArray(setCookie) ? setCookie : [String(setCookie)];
          let token = '';
          for (const cookie of cookies) {
            const match = cookie.match(/better-auth\.session_token=([^;]+)/);
            if (match) {
              token = match[1];
              break;
            }
          }
          if (token) {
            const separator = location.includes('?') ? '&' : '?';
            location = `${location}${separator}token=${token}`;
            res.setHeader('location', location);
          }
        }
      }
    }
    return originalWriteHead.apply(this, arguments as any);
  };
  next();
});

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
