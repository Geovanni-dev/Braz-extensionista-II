/* we create a singleton instance of PrismaClient to avoid creating multiple instances in development,
which can lead to issues with hot reloading and database connections*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
