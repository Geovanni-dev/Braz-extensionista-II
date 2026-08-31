import crypto from 'node:crypto';
import { env } from '../config/env.js';
import logger from '../logger.js';
import { ErroAoEnviarEmailError } from '../errors.js';

export const gerarCodigo = () => crypto.randomInt(100000, 1000000).toString();

export const enviarEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
) => {
  try {
    const resposta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        htmlContent,
        sender: {
          name: 'BRAZ: ASSISTENTE EDUCACIONAL',
          email: env.BREVO_EMAIL,
        },
        to: [{ email: to }],
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      throw new ErroAoEnviarEmailError(
        `Brevo respondeu ${resposta.status}: ${detalhe}`,
      );
    }
    return resposta;
  } catch (error) {
    logger.error(error, 'Erro ao enviar email');
    throw error;
  }
};
