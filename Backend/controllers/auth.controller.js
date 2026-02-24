import { validationResult } from 'express-validator';
import * as authService from '../services/auth.service.js';
import  { NODE_ENV } from '../config/env.js';

const isProduction = NODE_ENV == 'production';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.errors = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw error;
  }
};

export const register = async (req, res, next) => {
  try {
    validate(req);
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const result = await authService.verifyEmail(token);
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    validate(req);
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login({ email, password });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) { next(err); }
};

export const refreshToken = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    const { accessToken, newRefreshToken } = await authService.refreshTokens(rawRefreshToken);
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true, accessToken });
  } catch (err) { next(err); }
};

export const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    await authService.logout(rawRefreshToken);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

export const forgotPassword = async (req, res, next) => {
  try {
    validate(req);
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    validate(req);
    const result = await authService.resetPassword(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};