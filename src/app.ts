import express, { Application, Request, Response, NextFunction } from 'express';
import { IndexRouters } from './app/routes';

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use('/api/v1/', IndexRouters);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

// Global error handler – logs the full error so we can debug
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err?.statusCode || 500).json({
    success: false,
    message: err?.message || "Internal server error",
  });
});

export default app;