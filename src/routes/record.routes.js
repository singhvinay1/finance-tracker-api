const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createRecordSchema, updateRecordSchema } = require('../validators/record.validator');

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records CRUD
 */

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 example: "2024-01-15"
 *               note:
 *                 type: string
 *                 example: January salary
 *     responses:
 *       201:
 *         description: Record created
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Validation failed
 */
router.post('/', authenticate, authorize('ADMIN'), validate(createRecordSchema), recordController.createRecord);

/**
 * @swagger
 * /records:
 *   get:
 *     summary: List financial records with filtering and pagination (all roles)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Records retrieved
 */
router.get('/', authenticate, authorize('VIEWER', 'ANALYST', 'ADMIN'), recordController.getRecords);

/**
 * @swagger
 * /records/{id}:
 *   put:
 *     summary: Update a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 *       404:
 *         description: Record not found
 */
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateRecordSchema), recordController.updateRecord);

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Soft-delete a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted
 *       404:
 *         description: Record not found
 */
router.delete('/:id', authenticate, authorize('ADMIN'), recordController.deleteRecord);

module.exports = router;
