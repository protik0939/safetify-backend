import express, { Application, Request, Response } from 'express';
import { IndexRouters } from './app/routes';

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use('/api/v1/', IndexRouters);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

export default app;