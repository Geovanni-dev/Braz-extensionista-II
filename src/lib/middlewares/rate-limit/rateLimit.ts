import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import client from '../../redis/client.js';

const criarStore = (prefixo: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => client.sendCommand(args),
    prefix: prefixo,
  });

/* It does not protect against internal abuse because the entire school shares the same IP due to NAT. A single student running a script can exceed the quota and block other users. That scenario can only be resolved by tracking authenticated users via route-level limiters that run after JWT validation.
The globalLimiter catches external bots; since they have their own IPs, they end up blocking only themselves. */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true, //sends RateLimit-* headers new standard
  legacyHeaders: false, // disables X-RateLimit-* old standard
  store: criarStore('limiter:global:'),
  message: {
    error: 'Muitas solicitações. Aguarde um minuto e tente novamente',
  },
});

export const loginLimiterProfessor = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: criarStore('limiter:loginProfessor:'),

  /* ipKeyGenerator is a utility from the Express rate-limiting library itself. It normalizes the IP address (especially IPv6, which needs to be grouped by range rather than exact address). We use it only as a fallback for requests that arrive without a professorId.*/
  keyGenerator: (req) => req.body?.professorId ?? ipKeyGenerator(req.ip ?? ''),

  /*Logging in correctly doesn't use up the quota. Without this, a teacher logging in and out multiple times a day would be blocked, as if it were an attack.*/
  skipSuccessfulRequests: true,
  message: {
    error: 'Muitas tentativas de acesso. Aguarde um minuto e tente novamente.',
  },
});

export const loginLimiterAluno = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: criarStore('limiter:loginAluno:'),
  keyGenerator: (req) => req.body?.aluno.id ?? ipKeyGenerator(req.ip ?? ''),
  skipSuccessfulRequests: true,
  message: {
    error: 'Muitas tentativas de acesso. Aguarde um minuto e tente novamente.',
  },
});
