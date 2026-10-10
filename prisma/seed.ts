import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { ensureSuperAdmin } from "../src/lib/superAdmin.js";

try {
	await ensureSuperAdmin({ strict: true });
} finally {
	await prisma.$disconnect();
}
