import client from '../../redis/client.js';

const TTL = 5 * 60;

const generateKey = (alunoId: string) => `codigoReset:${alunoId}`;

export const setCodigoResetCache = async (alunoId: string, codigo: string) => {
  const key = generateKey(alunoId);
  await client.set(key, codigo, { EX: TTL });
};

export const getCodigoResetCache = async (
  alunoId: string,
): Promise<string | null> => {
  const key = generateKey(alunoId);
  const raw = await client.get(key);
  return raw;
};

export const deleteCodigoResetCache = async (alunoId: string) => {
  const key = generateKey(alunoId);
  await client.del(key);
};
