const z = require("zod");

// Register validation schema - Updated for your schema
const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z.string().email("Please enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),

  role: z
    .enum(["ADMIN", "DEVELOPER", "VIEWER"], {
      // ✅ Match your schema
      errorMap: () => ({ message: "Role must be ADMIN, DEVELOPER, or VIEWER" }),
    })
    .default("DEVELOPER") // ✅ Match your schema default
    .optional(),
});

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Update profile validation schema
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),

  email: z.string().email("Please enter a valid email address").optional(),

  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

// Change password validation schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(100, "New password cannot exceed 100 characters"),

    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
