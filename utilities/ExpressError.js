class ExpressError extends Error {
    constructor(message, statusCode) {
        // This will create a constructor that takes in a message and a status code.
        super();
        // This will call the constructor of the Error class.
        this.message = message;
        // This will set the message property of the Error class to the message that was passed in.
        this.statusCode = statusCode;
        // This will set the status code property of the Error class to the status code that was passed in.
    }
}
// This will create a new class called ExpressError that extends the Error class.

module.exports = ExpressError; // This will export the ExpressError class.