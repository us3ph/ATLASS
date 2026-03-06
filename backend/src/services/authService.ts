import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { userRepository, profileRepository } from "../repositories";
import { AppError } from "../middleware";
import {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  AuthTokenPayload,
  UserPublic,
} from "../types";

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";

const generateToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
};

const formatUserPublic = (user: {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: Date;
}): UserPublic => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  role: user.role as UserPublic["role"],
  createdAt: user.created_at,
});

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new AppError("Email is already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);

    const newUser = await userRepository.create(
      payload.email,
      hashedPassword,
      payload.fullName,
      payload.role
    );

    // Auto-create developer profile if user is a developer
    if (payload.role === "developer") {
      await profileRepository.createForUser(newUser.id);
    }

    const tokenPayload: AuthTokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const token = generateToken(tokenPayload);
    const userPublic = formatUserPublic(newUser);

    return { token, user: userPublic };
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(payload.email);
    if (!existingUser) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(payload.password, existingUser.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokenPayload: AuthTokenPayload = {
      userId: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    };

    const token = generateToken(tokenPayload);
    const userPublic = formatUserPublic(existingUser);

    return { token, user: userPublic };
  },
};
