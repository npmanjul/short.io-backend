const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    statusCode: statusCode,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
