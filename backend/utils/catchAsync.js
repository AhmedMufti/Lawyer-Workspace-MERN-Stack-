/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 * 
 * Usage: catchAsync(async (req, res, next) => { ... })
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;
