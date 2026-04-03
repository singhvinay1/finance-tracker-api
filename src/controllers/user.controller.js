const userService = require('../services/user.service');
const { success, error } = require('../utils/response');

const getAllUsers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await userService.getAllUsers({
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, parseInt(limit) || 10),
    });
    return success(res, result, 'Users retrieved successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const updateStatus = async (req, res) => {
  try {
    const user = await userService.updateStatus(req.params.id, req.validatedBody.status);
    return success(res, user, 'User status updated');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const updateRole = async (req, res) => {
  try {
    const user = await userService.updateRole(req.params.id, req.validatedBody.role);
    return success(res, user, 'User role updated');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

module.exports = { getAllUsers, updateStatus, updateRole };
