import { app } from "./app.js";
import { env } from "./config/env.js";
import redisClient from "./lib/redis.js";
import { ensureSuperAdmin } from "./lib/superAdmin.js";

const main = async () => {
	await ensureSuperAdmin();

	if (!redisClient.isOpen) {
		try {
			await redisClient.connect();
			console.log("Redis connected!");
		} catch (error) {
			console.error("Redis is unavailable:", error);
		}
	}

	app.listen(env.port, () => {
		console.log(`Server running on port ${env.port}`);
	});
};

main().catch((error) => {
	console.error("Failed to start server:", error);
	process.exitCode = 1;
});
