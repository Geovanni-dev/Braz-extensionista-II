/*
The Express Request type lacks the professor field, and
authMiddleware needs to attach the professor object there. Since
we cannot edit @types/express, I extended the type here. Interfaces
with the same name merge, so this adds the field rather than replacing it.
It is optional because the middleware does not run on public routes.
The "export {}" marks the file as a module; without it, declare module
would create a new module instead of extending the existing one.
*/

declare module 'express-serve-static-core' {
  interface Request {
    professor?: {
      id: string;
      nome: string;
    };
  }
}

export {};
