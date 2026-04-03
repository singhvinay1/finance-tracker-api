const recordService = require('../services/record.service');
const { success, error } = require('../utils/response');

const createRecord = async (req, res) => {
  try {
    const record = await recordService.createRecord(req.validatedBody, req.user.id);
    return success(res, record, 'Record created', 201);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const getRecords = async (req, res) => {
  try {
    const { page, limit, type, category, startDate, endDate } = req.query;
    const result = await recordService.getRecords({
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, parseInt(limit) || 10),
      type,
      category,
      startDate,
      endDate,
    });
    return success(res, result, 'Records retrieved');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const updateRecord = async (req, res) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.validatedBody);
    return success(res, record, 'Record updated');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const deleteRecord = async (req, res) => {
  try {
    await recordService.deleteRecord(req.params.id);
    return success(res, null, 'Record deleted');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

module.exports = { createRecord, getRecords, updateRecord, deleteRecord };
