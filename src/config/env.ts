import "dotenv/config";

const required = (name: string): string => {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is required`);
	}

	return value;
};

const optionalPort = (name: string, fallback: number): number => {
	const value = process.env[name];
	if (!value) {
		return fallback;
	}

	const port = Number(value);
	if (!Number.isInteger(port) || port < 0 || port >= 65536) {
		throw new Error(`${name} must be a valid port number`);
	}

	return port;
};

const optionalBoolean = (name: string, fallback: boolean): boolean => {
	const value = process.env[name];
	if (!value) {
		return fallback;
	}

	if (value !== "true" && value !== "false") {
		throw new Error(`${name} must be true or false`);
	}

	return value === "true";
};

export const env = {
	databaseUrl: required("DATABASE_URL"),
	jwt_access_secret: process.env.JWT_ACCESS_SECRET ?? required("JWT_SECRET"),
	jwt_refresh_secret:
		process.env.JWT_REFRESH_SECRET ??
		process.env.JWT_SECRET ??
		required("JWT_SECRET"),
	jwt_access_expires_in:
		process.env.JWT_ACCESS_EXPIRES_IN ?? process.env.JWT_EXPIRES_IN ?? "1d",
	jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
	port: Number(process.env.PORT ?? 3000),
	googleClientId: required("GOOGLE_CLIENT_ID"),
	googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
	redis_user: process.env.REDIS_USER ?? process.env.REEDIS_USER,
	redis_password: process.env.REDIS_PASSWORD ?? process.env.REEDIS_PASSWORD,
	redis_host: process.env.REDIS_HOST ?? process.env.REEDIS_HOST ?? "localhost",
	redis_port: optionalPort(
		"REDIS_PORT",
		Number(process.env.REEDIS_PORT ?? 6379),
	),
	super_admin_name: process.env.SUPER_ADMIN_NAME!,
	super_admin_email: process.env.SUPER_ADMIN_EMAIL!,
	super_admin_pass: process.env.SUPER_ADMIN_PASS!,
	smtp: {
		host: process.env.SMTP_HOST ?? "smtp.gmail.com",
		port: optionalPort("SMTP_PORT", 587),
		secure: optionalBoolean("SMTP_SECURE", false),
		user: required("SMTP_USER"),
		password: required("SMTP_PASSWORD"),
		from: process.env.SMTP_FROM ?? required("SMTP_USER"),
	},
};
