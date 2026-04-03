const { error } = require('../utils/response');

/**
 * Validate req.body against a Zod schema.
 * Parsed data is placed on req.validatedBody so controllers
 * never touch the raw body directly.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return error(res, 'Validation failed', 422, details);
    }
    req.validatedBody = result.data;
    next();
  };
};

module.exports = { validate };
