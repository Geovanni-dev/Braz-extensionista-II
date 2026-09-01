import client from '../../redis/client.js';

const TTL = 15 * 60;

const generateKey = (alunoId: string) => `codigo:${alunoId}`;

export const setCodigoCache = async (alunoId: string, codigo: string) => {
  const key = generateKey(alunoId);
  await client.set(key, codigo, { EX: TTL });
};

export const getCodigoCache = async (
  alunoId: string,
): Promise<string | null> => {
  const key = generateKey(alunoId);
  const raw = await client.get(key);
  return raw;
};

export const deleteCodigoCache = async (alunoId: string) => {
  const key = generateKey(alunoId);
  await client.del(key);
};
