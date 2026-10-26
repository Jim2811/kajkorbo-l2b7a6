import bcrypt from "bcryptjs";
import { Provider, Role } from "./../../../generated/prisma/enums";
import { env } from "../../config/env.js";
import { deleteImage, getPublicIdFromImageUrl, uploadImage, } from "../../lib/cloudinary.js";
import { sendEmailVerificationOtp, sendPasswordResetOtp, sendWelcomeEmail, } from "../../lib/email.js";
import { googleClient } from "../../lib/googleAuth.js";
import { prisma } from "../../lib/prisma";
import redisClient from "../../lib/redis.js";
import { AppError } from "../../utils/AppError.js";
import { jwtUtils } from "../../utils/jwtUtils.js";
import { generateOtp } from "../../utils/otp.js";
const PASSWORD_RESET_OTP_TTL_SECONDS = 10 * 60;
const EMAIL_VERIFICATION_OTP_TTL_SECONDS = 10 * 60;
const passwordResetOtpKey = (email) => `password-reset-otp:${email}`;
const emailVerificationOtpKey = (email) => `email-verification-otp:${email}`;
const registerUserIntoDB = async (payload) => {
    const { name, email, password, avatar } = payload;
    const existingUser = await prisma.uSER.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.uSER.create({
        data: {
            name,
            email,
            avatar: avatar ?? null,
            provider: "LOCAL",
            role: Role.USER,
            password: hashedPassword,
        },
    });
    const verificationOtp = generateOtp();
    await redisClient.set(emailVerificationOtpKey(email), verificationOtp, {
        EX: EMAIL_VERIFICATION_OTP_TTL_SECONDS,
    });
    await sendEmailVerificationOtp(email, verificationOtp);
    const user = await prisma.uSER.findUnique({
        where: {
            id: newUser.id,
            email: newUser.email || email,
        },
        omit: {
            password: true,
        },
    });
    return user;
};
const loginIntoDB = async (payload) => {
    const { email, password } = payload;
    const user = await prisma.uSER.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (!user.password) {
        throw new Error("This account does not have a password");
    }
    if (!user.isVerified) {
        throw new AppError(403, "Please verify your email before logging in");
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
        throw new Error("Invalid password");
    }
    const userWithoutPassword = await prisma.uSER.findUnique({
        where: { id: user.id },
        omit: { password: true },
    });
    if (!userWithoutPassword) {
        throw new AppError(404, "User not found");
    }
    const jwtPayload = userWithoutPassword;
    const accessToken = jwtUtils.createToken(jwtPayload, env.jwt_access_secret, env.jwt_access_expires_in);
    const refreshToken = jwtUtils.createToken(jwtPayload, env.jwt_refresh_secret, env.jwt_refresh_expires_in);
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
const verifyEmail = async (payload) => {
    const { email, otp } = payload;
    const storedOtp = await redisClient.get(emailVerificationOtpKey(email));
    if (!storedOtp || storedOtp !== otp) {
        throw new AppError(400, "Invalid or expired verification OTP");
    }
    const user = await prisma.uSER.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError(404, "User not found");
    }
    if (user.isVerified) {
        await redisClient.del(emailVerificationOtpKey(email));
        return prisma.uSER.findUnique({
            where: { id: user.id },
            omit: { password: true },
        });
    }
    const verifiedUser = await prisma.uSER.update({
        where: { id: user.id },
        data: { isVerified: true },
        omit: { password: true },
    });
    await sendWelcomeEmail(verifiedUser.email, verifiedUser.name);
    await redisClient.del(emailVerificationOtpKey(email));
    return verifiedUser;
};
const getMyProfile = async (userId) => {
    const user = await prisma.uSER.findUnique({
        where: { id: userId },
        omit: { password: true },
    });
    if (!user) {
        throw new AppError(404, "User not found");
    }
    return user;
};
const updateProfile = async (userId, payload, file) => {
    const currentUser = await prisma.uSER.findUnique({
        where: { id: userId },
        select: { avatar: true, avatarPublicId: true },
    });
    if (!currentUser) {
        throw new AppError(404, "User not found");
    }
    let avatar = currentUser.avatar;
    let avatarPublicId = currentUser.avatarPublicId;
    let uploadedPublicId;
    if (file) {
        const uploadedImage = await uploadImage(file.buffer, "kajkorbo/avatars");
        avatar = uploadedImage.secure_url;
        avatarPublicId = uploadedImage.public_id;
        uploadedPublicId = uploadedImage.public_id;
    }
    const updateUser = () => prisma.uSER.update({
        where: { id: userId },
        data: {
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(file ? { avatar, avatarPublicId } : {}),
        },
        omit: { password: true },
    });
    let updatedUser;
    try {
        updatedUser = await updateUser();
    }
    catch (error) {
        if (uploadedPublicId) {
            try {
                await deleteImage(uploadedPublicId);
            }
            catch {
                // Preserve the original database error.
            }
        }
        throw error;
    }
    if (file && currentUser.avatar) {
        const previousPublicId = currentUser.avatarPublicId ?? getPublicIdFromImageUrl(currentUser.avatar);
        if (previousPublicId && previousPublicId !== uploadedPublicId) {
            await deleteImage(previousPublicId);
        }
    }
    return updatedUser;
};
const uploadAvatar = async (userId, file) => {
    return updateProfile(userId, {}, file);
};
const googleLogin = async (payload) => {
    let googleIdTokenPayload = null;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: payload.idToken,
            audience: env.googleClientId,
        });
        googleIdTokenPayload = ticket.getPayload();
    }
    catch {
        throw new Error("Invalid or Expired Google Id Token");
    }
    if (!googleIdTokenPayload) {
        throw new Error("Invalid or Expired Google Id Token");
    }
    const googleEmail = googleIdTokenPayload.email?.trim().toLowerCase();
    const googleId = googleIdTokenPayload.sub;
    if (!googleEmail ||
        !googleId ||
        googleIdTokenPayload.email_verified !== true) {
        throw new AppError(401, "Google account email is not verified");
    }
    let user = await prisma.uSER.findUnique({
        where: { googleId },
    });
    if (!user) {
        user = await prisma.uSER.findFirst({
            where: {
                email: { equals: googleEmail, mode: "insensitive" },
            },
        });
    }
    if (!user) {
        user = await prisma.uSER.create({
            data: {
                name: googleIdTokenPayload.name ?? googleEmail,
                email: googleEmail,
                role: Role.USER,
                googleId,
                provider: Provider.GOOGLE,
                isVerified: true,
            },
        });
    }
    else if (!user.googleId || user.googleId !== googleId) {
        user = await prisma.uSER.update({
            where: { id: user.id },
            data: {
                googleId,
                isVerified: true,
            },
        });
    }
    if (user.status !== "ACTIVE" || user.deletedAt) {
        throw new AppError(403, "Your account is not active and cannot access this resource.");
    }
    const userWithoutPassword = await prisma.uSER.findUnique({
        where: { id: user.id },
        omit: { password: true },
    });
    if (!userWithoutPassword) {
        throw new AppError(404, "User not found");
    }
    const jwtPayload = userWithoutPassword;
    const accessToken = jwtUtils.createToken(jwtPayload, env.jwt_access_secret, env.jwt_access_expires_in);
    const refreshToken = jwtUtils.createToken(jwtPayload, env.jwt_refresh_secret, env.jwt_refresh_expires_in);
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
const forgotPassword = async (payload) => {
    const { email } = payload;
    const isUserExists = await prisma.uSER.findUnique({
        where: {
            email,
        },
    });
    if (!isUserExists) {
        throw new AppError(404, "User not found");
    }
    const otp = generateOtp();
    await redisClient.set(passwordResetOtpKey(email), otp, {
        EX: PASSWORD_RESET_OTP_TTL_SECONDS,
    });
    await sendPasswordResetOtp(email, otp);
    return {
        message: "OTP sent successfully",
    };
};
const resetPassword = async (payload) => {
    const { email, newPassword, otp } = payload;
    const storedOtp = await redisClient.get(passwordResetOtpKey(email));
    if (!storedOtp || storedOtp !== otp) {
        throw new AppError(400, "Invalid or expired OTP");
    }
    const user = await prisma.uSER.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError(404, "User not found");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.uSER.update({
        where: { id: user.id },
        data: { password: hashedPassword },
        omit: { password: true },
    });
    await redisClient.del(passwordResetOtpKey(email));
    return updatedUser;
};
export const authService = {
    registerUserIntoDB,
    verifyEmail,
    loginIntoDB,
    getMyProfile,
    updateProfile,
    uploadAvatar,
    googleLogin,
    forgotPassword,
    resetPassword,
};
//# sourceMappingURL=auth.service.js.map