//--- imports
import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import chatRoutes from './lib/Chat/routes/chatRoutes.js';
import aulaRoutes from './lib/Aula/routes/aulaRoutes.js';

class Server {
  public app: Express;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use('/chat', chatRoutes);
    this.app.use('/aula', aulaRoutes);
    this.app.get('/', (_req, res) => {
      res.send('Hello World!');
    });
  }
}

export const app = new Server().app;
