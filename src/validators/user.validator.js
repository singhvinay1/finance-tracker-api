const { z } = require('zod');

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

const updateRoleSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']),
});

module.exports = { updateStatusSchema, updateRoleSchema };
