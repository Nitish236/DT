const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class DatabaseWriteError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.SERVICE_UNAVAILABLE;           // Added the Status code by default (503)
  }
}

module.exports = DatabaseWriteError;