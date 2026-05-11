import * as z from "zod";

const validRegisterSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(3, "Full name must be at least 3 characters"),

  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .email("Please provide a valid email"),

  username: z
    .string({
      required_error: "Username is required",
    })
    .trim()
    .min(3, "Username must be at least 3 characters"),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters"),
});

const validLoginSchema = z
  .object({
    email: z.string().trim().email("Please provide a valid email").optional(),

    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .optional(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.email || data.username, {
    message: "Please provide either username or email",
  });

const validChangePassSchema = z.object({
  oldPassword: z
    .string({
      required_error: "Old password is required",
    })
    .min(6, "Old password must be at least 6 characters"),

  newPassword: z
    .string({
      required_error: "New password is required",
    })
    .min(6, "New password must be at least 6 characters"),
});

const validUpdateAccountSchema = z
  .object({
    fullName: z
      .string({
        required_error: "Full name is required",
      })
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .optional(),

    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email")
      .optional(),
  })
  .refine((data) => data.fullName || data.email, {
    message: "At least one field is required to update account",
  });

export {
  validRegisterSchema,
  validLoginSchema,
  validChangePassSchema,
  validUpdateAccountSchema,
};
