import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import * as validation from '../middlewares/auth.validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post('/register', authLimiter, validation.registerValidation, controller.register);
router.post('/login', authLimiter, validation.loginValidation, controller.login);
router.post('/forgot-password', authLimiter, validation.forgotPasswordValidation, controller.forgotPassword);

router.get('/verify-email', controller.verifyEmail);
router.post('/refresh', controller.refreshToken);
router.post('/logout', controller.logout);
router.post('/reset-password', validation.resetPasswordValidation, controller.resetPassword);

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;