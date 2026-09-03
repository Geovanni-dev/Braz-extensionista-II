//--- imports
import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import { globalLimiter } from './lib/middlewares/rate-limit/rateLimit.js';
import chatRoutes from './lib/Chat/routes/chatRoutes.js';
import aulaRoutes from './lib/Aula/routes/aulaRoutes.js';
import professorRoutes from './lib/Professor/routes/professorRoutes.js';
import alunoRoutes from './lib/Aluno/routes/alunoRoutes.js';
import { env } from './lib/config/env.js';

class Server {
  public app: Express;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.set('trust proxy', 1);
    const clientUrl = env.CLIENT_URL;
    this.app.use(
      cors({
        origin: clientUrl.split(',').map((url) => url.trim()),
        exposedHeaders: ['RateLimit-Reset', 'RateLimit-Remaining'],
      }),
    );
    this.app.use(express.json());
    this.app.use(globalLimiter);
  }

  private routes(): void {
    this.app.use('/chat', chatRoutes);
    this.app.use('/aula', aulaRoutes);
    this.app.use('/professor', professorRoutes);
    this.app.use('/aluno', alunoRoutes);
    this.app.get('/', (_req, res) => {
      res.send('The server is up!');
    });
  }
}

export const app = new Server().app;
