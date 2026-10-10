import bcrypt from "bcryptjs";
import { Provider, Role } from "../../generated/prisma/enums.js";
import { prisma } from "./prisma.js";

export const ensureSuperAdmin = async ({ strict = false } = {}) => {
	const existingSuperAdmin = await prisma.uSER.findFirst({
		where: { role: Role.SUPER_ADMIN, deletedAt: null },
		select: { id: true, email: true },
	});

	if (existingSuperAdmin) {
		console.log(`Super admin already exists: ${existingSuperAdmin.email}`);
		return existingSuperAdmin;
	}

	const emailValue = process.env.SUPER_ADMIN_EMAIL?.trim();
	const password = process.env.SUPER_ADMIN_PASSWORD?.trim();
	if (!emailValue || !password) {
		const message =
			"SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required to create the first super admin";
		if (strict) {
			throw new Error(message);
		}
		console.warn(`${message}. Server will continue without creating one.`);
		return null;
	}

	const email = emailValue.toLowerCase();
	const name = process.env.SUPER_ADMIN_NAME?.trim() || "Super Admin";
	const hashedPassword = await bcrypt.hash(password, 12);

	const superAdmin = await prisma.uSER.upsert({
		where: { email },
		update: {
			name,
			password: hashedPassword,
			provider: Provider.LOCAL,
			role: Role.SUPER_ADMIN,
			isVerified: true,
			deletedAt: null,
		},
		create: {
			name,
			email,
			password: hashedPassword,
			provider: Provider.LOCAL,
			role: Role.SUPER_ADMIN,
			isVerified: true,
		},
		select: { id: true, email: true },
	});

	console.log(`Created super admin: ${superAdmin.email}`);
	return superAdmin;
};
