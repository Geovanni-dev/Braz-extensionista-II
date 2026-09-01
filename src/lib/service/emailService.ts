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

export const enviarCodigoVerificacao = async (
  to: string,
  code: string,
  name: string,
) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de conta - Braz</title>
</head>
<body style="margin:0; padding:24px; background-color:#000000; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px; width:100%; background-color:#0a0a0a; border-radius:12px; border-top:4px solid #0FA38E;">
          <tr>
            <td style="padding:40px;">

              <h1 style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:1px; margin:0 0 4px 0;">
                BRAZ
              </h1>
              <p style="color:#0FA38E; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin:0 0 40px 0;">
                Assistente Educacional
              </p>

              <h2 style="color:#ffffff; font-size:24px; font-weight:600; margin:0 0 16px 0;">
                Confirme seu email
              </h2>

              <p style="color:#a0a0a0; font-size:16px; line-height:1.6; margin:0 0 32px 0;">
                Olá, <strong style="color:#E6F0F5;">${name}</strong>. Use o código abaixo para confirmar sua conta e começar a estudar com o Braz. Ele expira em 15 minutos.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F2D4D; border-radius:10px; margin-bottom:32px;">
                <tr>
                  <td align="center" style="padding:28px;">
                    <span style="font-size:34px; font-weight:800; letter-spacing:10px; color:#FFC857;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="color:#707070; font-size:14px; line-height:1.6; margin:0;">
                Se você não criou uma conta no Braz, ignore este email.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:48px; border-top:1px solid #1f1f1f;">
                <tr>
                  <td style="padding-top:20px;">
                    <p style="font-size:11px; color:#555555; margin:0; text-transform:uppercase; letter-spacing:1px; line-height:1.6;">
                      Colégio Estadual Umbelina Braz Gomides<br>
                      Não responda a este email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  await enviarEmail(
    to,
    'Verifique seu acesso - Braz: Assistente educacional',
    html,
  );
};

export const enviarCodigoRecuperacao = async (
  to: string,
  code: string,
  name: string,
) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de senha - Braz</title>
</head>
<body style="margin:0; padding:24px; background-color:#000000; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px; width:100%; background-color:#0a0a0a; border-radius:12px; border-top:4px solid #0FA38E;">
          <tr>
            <td style="padding:40px;">

              <h1 style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:1px; margin:0 0 4px 0;">
                BRAZ
              </h1>
              <p style="color:#0FA38E; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin:0 0 40px 0;">
                Assistente Educacional
              </p>

              <h2 style="color:#ffffff; font-size:24px; font-weight:600; margin:0 0 16px 0;">
                Redefinir sua senha
              </h2>

              <p style="color:#a0a0a0; font-size:16px; line-height:1.6; margin:0 0 32px 0;">
                Olá, <strong style="color:#E6F0F5;">${name}</strong>. Recebemos um pedido para redefinir sua senha. Use o código abaixo para criar uma nova. Ele expira em 15 minutos.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F2D4D; border-radius:10px; margin-bottom:32px;">
                <tr>
                  <td align="center" style="padding:28px;">
                    <span style="font-size:34px; font-weight:800; letter-spacing:10px; color:#FFC857;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#141414; border-left:3px solid #FFC857; border-radius:6px; margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#a0a0a0; font-size:14px; line-height:1.6; margin:0;">
                      Se você não pediu para redefinir sua senha, ignore este email — sua senha atual continua valendo. Se isso se repetir, avise sua professora.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px; border-top:1px solid #1f1f1f;">
                <tr>
                  <td style="padding-top:20px;">
                    <p style="font-size:11px; color:#555555; margin:0; text-transform:uppercase; letter-spacing:1px; line-height:1.6;">
                      Colégio Estadual Umbelina Braz Gomides<br>
                      Não responda a este email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  await enviarEmail(to, 'Redefinição de senha - Braz', html);
};
