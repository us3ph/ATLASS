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

  // ─── OAuth Methods ───
  async findByOAuth(provider: string, oauthId: string) {
    return prisma.users.findFirst({
      where: {
        oauth_provider: provider,
        oauth_id: oauthId,
      },
    });
  },

  async createOAuth(
    email: string,
    fullName: string,
    role: UserRole,
    oauthProvider: string,
    oauthId: string
  ) {
    return prisma.users.create({
      data: {
        email,
        full_name: fullName,
        role,
        oauth_provider: oauthProvider,
        oauth_id: oauthId,
        password: null,
      },
    });
  },

  async linkOAuth(userId: string, provider: string, oauthId: string) {
    return prisma.users.update({
      where: { id: userId },
      data: {
        oauth_provider: provider,
        oauth_id: oauthId,
      },
    });
  },

  async countAll() {
    return prisma.users.count({
      where: { role: "developer" },
    });
  },
};
