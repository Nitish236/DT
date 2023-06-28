class CustomAPIError extends Error {                  // Made a template to create error class
  constructor(message) {
    super(message)
  }
}

module.exports = CustomAPIError
