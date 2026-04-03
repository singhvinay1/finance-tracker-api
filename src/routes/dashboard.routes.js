const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics — Analyst and Admin
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Total income, expense, net balance, and category breakdown
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpense:
 *                   type: number
 *                 netBalance:
 *                   type: number
 *                 categoryBreakdown:
 *                   type: array
 *       403:
 *         description: Forbidden — VIEWER cannot access analytics
 */
router.get('/summary', authenticate, authorize('ANALYST', 'ADMIN'), dashboardController.getSummary);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Month-over-month income and expense trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trend data grouped by type
 *       403:
 *         description: Forbidden — VIEWER cannot access analytics
 */
router.get('/trends', authenticate, authorize('ANALYST', 'ADMIN'), dashboardController.getTrends);

module.exports = router;
