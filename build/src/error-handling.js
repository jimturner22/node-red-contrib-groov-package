"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorDetails = (function () {
    function ErrorDetails(nodeShortErrorMsg, logLongErrorMsg) {
        this.nodeShortErrorMsg = nodeShortErrorMsg;
        this.logLongErrorMsg = logLongErrorMsg;
    }
    return ErrorDetails;
}());
exports.ErrorDetails = ErrorDetails;
var ResponseErrorMessages = (function () {
    function ResponseErrorMessages() {
    }
    ResponseErrorMessages.getErrorMsg = function (error) {
        var shortError = 'Error';
        var longError = 'Error';
        if (error.code !== undefined) {
            shortError = ResponseErrorMessages.errors[error.code];
            if (shortError === undefined) {
                shortError = error.code;
                longError = 'Error code: ' + error.code;
            }
            else {
                longError = shortError + '. Error code: ' + error.code;
            }
            if (error.syscall !== undefined) {
                longError = longError + ' from system call "' + error.syscall + '"';
            }
        }
        else if (error.reason !== undefined) {
            shortError = error.reason;
            longError = 'Error : ' + error.reason;
        }
        return new ErrorDetails(shortError, longError);
    };
    ResponseErrorMessages.errors = {
        'ECONNREFUSED': 'Connection refused',
        'ETIMEDOUT': 'Timeout',
        'EHOSTUNREACH': 'groov unreachable',
        'ENOTFOUND': 'Address not found',
        'EINVAL': 'Invalid argument',
        'EAI_AGAIN': 'Address not found',
        'DEPTH_ZERO_SELF_SIGNED_CERT': 'Problem with the security certificate',
    };
    return ResponseErrorMessages;
}());
exports.ResponseErrorMessages = ResponseErrorMessages;
var StatusCodeMessages = (function () {
    function StatusCodeMessages() {
    }
    StatusCodeMessages.getErrorMsg = function (statusCode) {
        var shortError = StatusCodeMessages.errors[statusCode];
        if (shortError === undefined) {
            shortError = 'Status code ' + statusCode;
        }
        var longError = shortError + '. HTTP response error : ' + statusCode;
        return new ErrorDetails(shortError, longError);
    };
    StatusCodeMessages.errors = {
        '400': 'Bad request',
        '401': 'Bad API key',
        '404': 'Not found',
    };
    return StatusCodeMessages;
}());
exports.StatusCodeMessages = StatusCodeMessages;
function handleErrorResponse(error, msg, node) {
    var errorDetails;
    if (error !== undefined) {
        if (typeof error === 'string') {
            errorDetails = new ErrorDetails(error, error);
            msg.groovError = {
                message: error
            };
        }
        else if (error.response !== undefined) {
            errorDetails = StatusCodeMessages.getErrorMsg(error.response.statusCode);
            msg.resError = {
                statusCode: error.response.statusCode,
                body: error.response.body
            };
        }
        else {
            errorDetails = ResponseErrorMessages.getErrorMsg(error);
            msg.reqError = error;
        }
    }
    node.status({ fill: "red", shape: "dot", text: errorDetails.nodeShortErrorMsg });
    node.error(errorDetails.logLongErrorMsg, msg);
}
exports.handleErrorResponse = handleErrorResponse;
