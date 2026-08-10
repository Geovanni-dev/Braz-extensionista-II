//--- imports
import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import chatRoutes from './lib/Braz/routes/chatRoutes.js';

class Server {
  public app: Express;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {}; // disable console.log in production
    }
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
    this.app.get('/', (_req, res) => {
      res.send('Hello World!');
    });
  }
}

export const app = new Server().app;
