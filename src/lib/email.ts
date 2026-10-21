import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
	host: env.smtp.host,
	port: env.smtp.port,
	secure: env.smtp.secure,
	auth: {
		user: env.smtp.user,
		pass: env.smtp.password,
	},
});

export const sendPasswordResetOtp = async (email: string, otp: string) => {
	await transporter.sendMail({
		from: env.smtp.from,
		to: email,
		subject: "Your Kajkorbo password reset OTP",
		text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
		html: `
			<p>Your Kajkorbo password reset OTP is:</p>
			<h2>${otp}</h2>
			<p>This OTP expires in 10 minutes.</p>
		`,
	});
};
