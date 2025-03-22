import { body, validationResult } from "express-validator";

const validateAppointment = () => {
  return [
    body("studentName").notEmpty().withMessage("Student name is required"),
    body("parentName").notEmpty().withMessage("Parent name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").matches(/^\d{10}$/).withMessage("Valid 10-digit phone number is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("time.hr")
      .isInt({ min: 0, max: 23 })
      .withMessage("Hour must be between 0 and 23"),
    body("time.min")
      .isInt({ min: 0, max: 59 })
      .withMessage("Minute must be between 0 and 59"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          // Instead of throwing an error, send the error response in JSON format.
          return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors.array(),
          });
        }
      next();
    },
  ];
};

export default validateAppointment;
