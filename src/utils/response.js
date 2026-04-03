/**
 * Uniform JSON response helpers.
 * All endpoints must go through these so the shape is always predictable.
 */

const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ error: false, message, data });
};

const error = (res, message = 'An error occurred', statusCode = 500, details = null) => {
  const payload = { error: true, message };
  if (details) payload.details = details;
  return res.status(statusCode).json(payload);
};

module.exports = { success, error };
