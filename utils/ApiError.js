class ApiError extends Error {
    constructor (
        statusCode,
        message,
        stack = ""
    ) {
        // super(message)
        super()
        this.statusCode = statusCode
        this.success = false;
        this.message = message
        this.errors = []

        if (stack) {
            this.stack = stack        
        }else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

// exports ApiError 
module.exports = ApiError;
