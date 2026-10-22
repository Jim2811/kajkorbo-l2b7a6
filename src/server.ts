import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import redisClient from "./lib/redis.js";

const main = async () => {
	try{
		await prisma.$connect();
		console.log("DB connected successfully!!!!!")
		await redisClient.connect();
		console.log("Redis Client connected!")
	
		app.listen(env.port, () => {
			console.log(`Server running on port ${env.port}`);
		});
	}
	catch(error){
		throw error
	}
};
main()
