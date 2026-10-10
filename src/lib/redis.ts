import { createClient } from "redis";
import { env } from "../config/env.js";

const redisClient = createClient({
	socket: {
		host: env.redis_host,
		port: env.redis_port,
		reconnectStrategy: false,
	},
	...(env.redis_user ? { username: env.redis_user } : {}),
	...(env.redis_password ? { password: env.redis_password } : {}),
});

redisClient.on("error", (error) => {
	console.error("Redis connection error:", error);
});

export default redisClient;
