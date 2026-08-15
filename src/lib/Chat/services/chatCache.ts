import client from '../../redis/client.js';

const TTL = 15 * 24 * 60 * 60; // 15 days

const generateKey = (aulaId: string, alunoId: string) =>
  `chat:${alunoId}:${aulaId}`;

export const setChat = async (
  aulaId: string,
  alunoId: string,
  role: 'user' | 'model',
  text: string,
) => {
  const key = generateKey(aulaId, alunoId);
  const turn = JSON.stringify({ role, text });

  const length = await client.rPush(key, turn); // adds the turn to the end of the list; returns the new size of the list

  //defines the first element as the first message of the conversation
  if (length === 1) {
    await client.expire(key, TTL); //Configure it so the TTL isn't reset with every message.
  }
  return length;
};

export const getChat = async (aulaId: string, alunoId: string) => {
  const key = generateKey(aulaId, alunoId);
  const turns = await client.lRange(key, 0, -1); // returns the list of turns in the chat
  return turns.map((turn) => JSON.parse(turn));
};

export const hasChat = async (aulaId: string, alunoId: string) => {
  const key = generateKey(aulaId, alunoId);
  return await client.exists(key);
};

export const deleteChat = async (aulaId: string, alunoId: string) => {
  const key = generateKey(aulaId, alunoId);
  return await client.del(key);
};
