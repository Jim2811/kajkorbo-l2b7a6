import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import redisClient from "./lib/redis.js";

const main = async () => {
	await prisma.$connect();
	console.log("DB connected successfully");
	await redisClient.connect();
	console.log("Redis Client connected");

	app.listen(env.port, () => {
		console.log(`Server running on port ${env.port}`);
	});
};
main().catch((error: unknown) => {
	console.error("Failed to start server", error);
	process.exitCode = 1;
});
