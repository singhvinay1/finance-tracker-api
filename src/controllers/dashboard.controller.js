const dashboardService = require('../services/dashboard.service');
const { success, error } = require('../utils/response');

const getSummary = async (req, res) => {
  try {
    const data = await dashboardService.getSummary();
    return success(res, data, 'Dashboard summary');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const getTrends = async (req, res) => {
  try {
    const data = await dashboardService.getTrends();
    return success(res, data, 'Monthly trends');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

module.exports = { getSummary, getTrends };
