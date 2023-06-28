const CustomAPIError = require('./custom-api')
const NotFoundError = require('./not-found')
const BadRequestError = require('./bad-request')
const DatabaseWriteError = require('./database-write-error');

module.exports = {
  CustomAPIError,
  NotFoundError,
  BadRequestError,
  DatabaseWriteError
}


//      To import all errors using single import
