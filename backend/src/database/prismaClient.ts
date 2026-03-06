import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export default prismaClient;
