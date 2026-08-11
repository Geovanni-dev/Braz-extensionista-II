import client from '../../redis/client.js';

const TTL = 90 * 60; // 90 minutes

const generateKey = (sessaoId: string, alunoId: string) =>
  `chat:${alunoId}:${sessaoId}`;

export const setChat = async (
  sessaoId: string,
  alunoId: string,
  role: 'user' | 'model',
  text: string,
) => {
  const key = generateKey(sessaoId, alunoId);
  const turn = JSON.stringify({ role, text });

  const length = await client.rPush(key, turn); // adds the turn to the end of the list; returns the new size of the list

  //defines the first element as the first message of the conversation
  if (length === 1) {
    await client.expire(key, TTL); //Configure it so the TTL isn't reset with every message.
  }
  return length;
};

export const getChat = async (sessaoId: string, alunoId: string) => {
  const key = generateKey(sessaoId, alunoId);
  const turns = await client.lRange(key, 0, -1); // returns the list of turns in the chat
  return turns.map((turn) => JSON.parse(turn));
};

export const hasChat = async (sessaoId: string, alunoId: string) => {
  const key = generateKey(sessaoId, alunoId);
  return await client.exists(key);
};

export const deleteChat = async (sessaoId: string, alunoId: string) => {
  const key = generateKey(sessaoId, alunoId);
  return await client.del(key);
};
