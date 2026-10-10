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
};
