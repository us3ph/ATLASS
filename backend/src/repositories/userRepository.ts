import { prisma } from "../database";
import { UserRole } from "../types";

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email },
    });
  },

  async findById(userId: string) {
    return prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  async create(email: string, hashedPassword: string, fullName: string, role: UserRole) {
    return prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        full_name: fullName,
        role,
      },
    });
  },

  async countAll() {
    return prisma.users.count({
      where: { role: "developer" },
    });
  },
};
