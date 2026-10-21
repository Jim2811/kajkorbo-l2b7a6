import {
	MemberStatus,
	PlanType,
	Role,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { ICreateOrganizationPayload } from "../auth/auth.interface.js";

const createOrganization = async (
	userId: string,
	payload: ICreateOrganizationPayload,
) => {
	const existingOrganization = await prisma.organization.findUnique({
		where: { email: payload.email },
	});

	if (existingOrganization) {
		throw new AppError(409, "An organization with this email already exists");
	}

	return prisma.$transaction(async (transaction) => {
		const organization = await transaction.organization.create({
			data: {
				...payload,
				plan: PlanType.FREE,
			},
		});

		await transaction.organizationMember.create({
			data: {
				organizationId: organization.id,
				userId,
				role: Role.ORG_OWNER,
				status: MemberStatus.ACTIVE,
			},
		});

		await transaction.uSER.update({
			where: { id: userId },
			data: { role: Role.ORG_OWNER },
		});

		return organization;
	});
};

export const organizationService = {
	createOrganization,
};
