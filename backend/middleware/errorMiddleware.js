const errorMiddleware = (err, req, res, next) => {

  console.log("ERROR CAUGHT:", err);

  // ZOD ERROR FIX (IMPORTANT)
  if (err?.name === "ZodError" || err?.issues) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues?.map(e => ({
        field: e.path?.[0],
        message: e.message
      })) || []
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Server error"
  });
};

module.exports = errorMiddleware;