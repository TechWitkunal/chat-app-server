class ApiResponse {
    constructor( statusCode, success, message, data ) {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = success
    }
}

module.exports = ApiResponse