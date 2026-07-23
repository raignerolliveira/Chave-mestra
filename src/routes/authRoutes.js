const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/securityMiddleware');

// Rotas públicas de Registro e Login
router.post('/register/options', authLimiter, authController.generateRegisterOptions);
router.post('/register/verify', authLimiter, authController.verifyRegistration);

router.post('/login/options', authLimiter, authController.generateLoginOptions);
router.post('/login/verify', authLimiter, authController.verifyLogin);

// Rotas privadas protegidas com controle de inatividade e verificação do cofre
router.get('/dashboard/data', requireAuth, authController.getDashboardData);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;