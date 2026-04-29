import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { signToken } from "../utils/jwt.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { sendEmail } from "../utils/email.js";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users, charities } from "../db/schema.js";
import { welcomeTemplate, resetPasswordTemplate } from "../utils/templates.js";

export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password, charityId, charityContributionPercent = 10 } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "fullName, email and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUsersList = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  
  const existingUser = existingUsersList[0];

  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  if (charityId) {
    const [charity] = await db.select().from(charities).where(eq(charities.id, charityId)).limit(1);
    if (!charity) {
      throw new ApiError(404, "Selected charity not found");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      selectedCharityId: charityId,
      charityContributionPercentage: charityContributionPercent,
    })
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      selectedCharityId: users.selectedCharityId,
      charityContributionPercentage: users.charityContributionPercentage,
    });

  const token = signToken({ userId: user.id, role: user.role });

  // Send email asynchronously (non-blocking)
  sendEmail({
    to: user.email,
    subject: "Welcome to The Golf Draw",
    html: welcomeTemplate({ 
      fullName: user.fullName, 
      dashboardUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard` 
    }),
  }).catch((err) => console.error("Email send error:", err));

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const userList = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  const user = userList[0];

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      selectedCharityId: user.selectedCharityId,
      charityContributionPercentage: user.charityContributionPercentage,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const userList = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user.id));

  const user = userList[0];

  res.json({
    success: true,
    user: user
      ? {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          selectedCharityId: user.selectedCharityId,
          charityContributionPercentage: user.charityContributionPercentage,
        }
      : null,
  });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const { charityId, charityContributionPercent } = req.body;

  if (charityContributionPercent !== undefined && (charityContributionPercent < 10 || charityContributionPercent > 100)) {
    throw new ApiError(400, "Contribution percentage must be between 10 and 100");
  }

  const updateData = {};
  if (charityId !== undefined) {
    const [charity] = await db.select().from(charities).where(eq(charities.id, charityId)).limit(1);
    if (!charity) {
      throw new ApiError(404, "Selected charity not found");
    }
    updateData.selectedCharityId = charityId;
  }
  if (charityContributionPercent !== undefined) updateData.charityContributionPercentage = charityContributionPercent;

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided for update");
  }

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, req.user.id))
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      selectedCharityId: users.selectedCharityId,
      charityContributionPercentage: users.charityContributionPercentage,
    });

  res.json({
    success: true,
    user: updatedUser,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

  if (!user) {
    // Return success even if user not found for security (avoid enumeration)
    return res.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await db.update(users).set({ resetToken: token, resetTokenExpires: expires }).where(eq(users.id, user.id));

  // In production, use your frontend URL from env
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request — The Golf Draw",
    html: resetPasswordTemplate({
      fullName: user.fullName,
      resetUrl
    }),
  });

  res.json({ success: true, message: "Reset link sent" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.resetToken, token))
    .limit(1);

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({ 
      password: hashedPassword, 
      resetToken: null, 
      resetTokenExpires: null,
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  res.json({ success: true, message: "Password updated successfully" });
});
