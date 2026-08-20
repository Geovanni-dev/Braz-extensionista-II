declare module 'express-serve-static-core' {
  interface Request {
    professor?: {
      id: string;
      nome: string;
    };
  }
}

export {};
