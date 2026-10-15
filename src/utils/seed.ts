import bcrypt from "bcryptjs";
import { Provider, Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

export const seedSuperAdmin = async () => {
    try{
        const isSuperAdminExist = await prisma.uSER.findFirst({
            where:{
                role: Role.SUPER_ADMIN
            }
        });

        if(isSuperAdminExist){
            console.log("Super Admin Exist!")
        };
        const name = env.super_admin_name
        const email = env.super_admin_email;
        const password = env.super_admin_pass
        const hashedPass = await bcrypt.hash(password, 10)
        const superAdmin = await prisma.uSER.create({
            data: {
                name,
                email,
                password: hashedPass,
                role: Role.SUPER_ADMIN,
                isVerified: true,
                provider: Provider.LOCAL
            }
        })
    } catch (error) {
        await prisma.uSER.delete({
            where: {
                email: env.super_admin_email
            }
        })
    }
}
