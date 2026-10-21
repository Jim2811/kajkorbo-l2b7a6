import { createClient } from "redis";
import { env } from "../config/env.js";

const redisClient = createClient({
	username: env.redis_user as string,
	password: env.redis_password as string,
	socket: {
		host: env.redis_host,
		port: env.redis_port,
	}
});

export default redisClient;
