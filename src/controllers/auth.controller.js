const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

const register = async (req, res) => {
  try {
    const result = await authService.register(req.validatedBody);
    return success(res, result, 'User registered successfully', 201);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.validatedBody);
    return success(res, result, 'Login successful');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

module.exports = { register, login };
