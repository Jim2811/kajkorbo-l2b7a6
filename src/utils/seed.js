import bcrypt from "bcryptjs";
import { Provider, Role } from "../../generated/prisma/enums.js";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
export const seedSuperAdmin = async () => {
    const existingSuperAdmin = await prisma.uSER.findFirst({
        where: { role: Role.SUPER_ADMIN },
        select: { id: true, email: true },
    });
    if (existingSuperAdmin) {
        console.log(`Super Admin already exists: ${existingSuperAdmin.email}`);
        return existingSuperAdmin;
    }
    const existingConfiguredUser = await prisma.uSER.findUnique({
        where: { email: env.super_admin_email },
        select: { id: true, role: true },
    });
    if (existingConfiguredUser) {
        throw new Error(`Cannot seed Super Admin: ${env.super_admin_email} already belongs to a non-admin user`);
    }
    const hashedPassword = await bcrypt.hash(env.super_admin_pass, 10);
    return prisma.uSER.create({
        data: {
            name: env.super_admin_name,
            email: env.super_admin_email,
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isVerified: true,
            provider: Provider.LOCAL,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
        },
    });
};
//# sourceMappingURL=seed.js.map