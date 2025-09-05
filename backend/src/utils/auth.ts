import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '@/config';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcryptRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    issuer: 'traknor-cmms',
    audience: 'traknor-users',
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.refreshTokenExpiresIn,
    issuer: 'traknor-cmms',
    audience: 'traknor-refresh',
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwtSecret) as JWTPayload;
};

export const generateRandomToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const generateInviteToken = (): string => {
  return generateRandomToken(16);
};

export const generate2FACode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const generateRecoveryCodes = (count: number = 8): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generate2FACode());
  }
  return codes;
};