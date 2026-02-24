import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import * as tokenService from '../services/token.service.js';
import * as emailService from '../services/email.service.js';
import logger from '../config/logger.js';

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const EMAIL_VERIFY_EXPIRES_MS = 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRES_MS = 15 * 60 * 1000;

const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

const generateSecureToken = () => crypto.randomBytes(32).toString('hex');

// ─── REGISTER ─────────────────────────────────────────────────────────────────

export const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'USER',
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFY_EXPIRES_MS),
  });

  try {
    await emailService.sendVerificationEmail(email, rawToken);
  } catch (emailErr) {
    logger.error('Failed to send verification email', { userId: user._id, error: emailErr.message });
  }

  logger.info('User registered', { userId: user._id, email });

  return {
    message: 'Registration successful. Please check your email to verify your account.',
    userId: user._id,
  };
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────

export const verifyEmail = async (rawToken) => {
  if (!rawToken) {
    const error = new Error('Verification token is required');
    error.statusCode = 400;
    throw error;
  }

  const hashedToken = hashToken(rawToken);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  logger.info('Email verified', { userId: user._id });
  return { message: 'Email verified successfully. You may now log in.' };
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email })
    .select('+password +failedLoginAttempts +lockUntil +isActive');

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    const error = new Error(`Account locked. Try again in ${remaining} minute(s).`);
    error.statusCode = 423;
    throw error;
  }

  if (!user.isEmailVerified) {
    const error = new Error('Please verify your email before logging in');
    error.statusCode = 403;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
      logger.warn('Account locked due to failed attempts', { email });
    }
    await user.save();
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const accessToken = tokenService.generateAccessToken(user);
  const { token: refreshToken, jti } = tokenService.generateRefreshToken(user);
  await tokenService.storeRefreshToken(user._id.toString(), jti);

  logger.info('User logged in', { userId: user._id });
  return { accessToken, refreshToken, user };
};

// ─── REFRESH TOKENS ───────────────────────────────────────────────────────────

export const refreshTokens = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    const error = new Error('Refresh token not found');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(rawRefreshToken);
  } catch {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const { userId, jti, tokenVersion } = decoded;

  const isValid = await tokenService.validateRefreshTokenInRedis(userId, jti);
  if (!isValid) {
    const error = new Error('Refresh token has been revoked');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  if (user.refreshTokenVersion !== tokenVersion) {
    await tokenService.deleteRefreshToken(userId, jti);
    const error = new Error('Refresh token version mismatch. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  await tokenService.deleteRefreshToken(userId, jti);

  const accessToken = tokenService.generateAccessToken(user);
  const { token: newRefreshToken, jti: newJti } = tokenService.generateRefreshToken(user);
  await tokenService.storeRefreshToken(userId, newJti);

  logger.info('Tokens refreshed', { userId });
  return { accessToken, newRefreshToken };
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

export const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  try {
    const decoded = tokenService.verifyRefreshToken(rawRefreshToken);
    await tokenService.deleteRefreshToken(decoded.userId, decoded.jti);
    logger.info('User logged out', { userId: decoded.userId });
  } catch (err) {
    logger.debug('Logout with invalid/expired token', { error: err.message });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

export const forgotPassword = async (email) => {
  const genericResponse = { message: 'If that email is registered, a reset link has been sent.' };

  const user = await User.findOne({ email });
  if (!user) return genericResponse;

  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);
  await user.save();

  try {
    await emailService.sendPasswordResetEmail(email, rawToken);
  } catch (emailErr) {
    logger.error('Failed to send password reset email', { userId: user._id, error: emailErr.message });
  }

  logger.info('Password reset requested', { userId: user._id });
  return genericResponse;
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

export const resetPassword = async ({ token: rawToken, password }) => {
  const hashedToken = hashToken(rawToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(password, SALT_ROUNDS);
  user.refreshTokenVersion += 1;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await tokenService.deleteAllRefreshTokens(user._id.toString());

  logger.info('Password reset successful', { userId: user._id });
  return { message: 'Password reset successful. Please log in with your new password.' };
};