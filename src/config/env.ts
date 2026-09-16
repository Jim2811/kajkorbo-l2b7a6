import "dotenv/config";

const required = (name: string): string => {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is required`);
	}

	return value;
};

export const env = {
	databaseUrl: required("DATABASE_URL"),
	jwtSecret: required("JWT_SECRET"),
	jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
	port: Number(process.env.PORT ?? 3000),
};
