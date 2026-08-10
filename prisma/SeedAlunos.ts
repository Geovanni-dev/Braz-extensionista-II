import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import { z } from 'zod';

const prisma = new PrismaClient();

//===================================== zod

const alunoSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
});

//=============================== seed

const seed = async () => {
  try {
    const { nome, email, senha } = alunoSchema.parse({
      nome: process.env.ALUNO_NAME,
      email: process.env.ALUNO_EMAIL,
      senha: process.env.ALUNO_PASSWORD,
    });
    console.log(' Dados validados pelo esquema do zod:');

    const passwordHash = await bcrypt.hash(senha, 10);

    const aluno = await prisma.aluno.upsert({
      where: { email },
      update: { nome, senha: passwordHash },
      create: {
        nome,
        email,
        senha: passwordHash,
      },
    });
    console.log(
      `Usuário criado/atualizado com sucesso: ${aluno.nome} (${aluno.email})`,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação do zod:', error.issues);
    } else {
      console.error('Erro ao criar o usuário:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
};

seed();
