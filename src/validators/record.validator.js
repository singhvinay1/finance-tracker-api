const { z } = require('zod');

const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  note: z.string().optional(),
});

const updateRecordSchema = z
  .object({
    amount: z.number().positive('Amount must be a positive number').optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().min(1).optional(),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
      .optional(),
    note: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required for update' });

module.exports = { createRecordSchema, updateRecordSchema };
