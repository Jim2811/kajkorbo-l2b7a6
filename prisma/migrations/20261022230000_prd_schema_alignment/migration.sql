CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BANNED', 'DEACTIVATED');
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');
CREATE TYPE "TeamMemberStatus" AS ENUM ('ACTIVE', 'REMOVED');
CREATE TYPE "TeamMemberRole" AS ENUM ('LEADER', 'MEMBER');
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'REJECTED', 'CANCELLED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "SubtaskStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUIRED', 'APPROVED', 'CANCELLED');
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'DISPUTED');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'INVITE', 'ACCEPT', 'REJECT', 'SUBMIT', 'APPROVE', 'REASSIGN', 'PAYMENT', 'BAN', 'UNBAN');

ALTER TYPE "MemberStatus" RENAME VALUE 'IVITED' TO 'INVITED';

ALTER TABLE "users"
    ADD COLUMN "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN "bannedAt" TIMESTAMP(3),
    ADD COLUMN "bannedReason" TEXT;

ALTER TABLE "organization"
    ADD COLUMN "description" TEXT,
    ADD COLUMN "logo" TEXT,
    ADD COLUMN "ownerId" TEXT,
    ADD COLUMN "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE';

UPDATE "organization" AS organization
SET "ownerId" = membership."userId"
FROM "organization_members" AS membership
WHERE membership."organizationId" = organization."id"
  AND membership."role" = 'ORG_OWNER'
  AND membership."status" = 'ACTIVE'
  AND organization."ownerId" IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "organization" WHERE "ownerId" IS NULL) THEN
        RAISE EXCEPTION 'Cannot align organizations: every organization must have an active owner';
    END IF;
END $$;

ALTER TABLE "organization"
    ALTER COLUMN "ownerId" SET NOT NULL;

CREATE UNIQUE INDEX "organization_ownerId_key" ON "organization"("ownerId");
CREATE INDEX "organization_status_idx" ON "organization"("status");
CREATE INDEX "organization_members_status_idx" ON "organization_members"("status");
CREATE INDEX "organization_members_userId_status_idx" ON "organization_members"("userId", "status");

ALTER TABLE "organization"
    ADD CONSTRAINT "organization_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "organization_members"
    ADD CONSTRAINT "organization_members_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "organization_members_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "OrganizationInvitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invitedUserId" TEXT,
    "invitedEmail" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrganizationInvitation_token_key" ON "OrganizationInvitation"("token");
CREATE INDEX "OrganizationInvitation_organizationId_status_idx" ON "OrganizationInvitation"("organizationId", "status");
CREATE INDEX "OrganizationInvitation_invitedEmail_status_idx" ON "OrganizationInvitation"("invitedEmail", "status");
ALTER TABLE "OrganizationInvitation"
    ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "OrganizationInvitation_invitedUserId_fkey"
    FOREIGN KEY ("invitedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "OrganizationInvitation_invitedById_fkey"
    FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT,
    "status" "TeamStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Team_organizationId_name_key" ON "Team"("organizationId", "name");
CREATE INDEX "Team_organizationId_status_idx" ON "Team"("organizationId", "status");
ALTER TABLE "Team"
    ADD CONSTRAINT "Team_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Team_leaderId_fkey"
    FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
CREATE INDEX "TeamMember_teamId_status_idx" ON "TeamMember"("teamId", "status");
CREATE INDEX "TeamMember_userId_status_idx" ON "TeamMember"("userId", "status");
ALTER TABLE "TeamMember"
    ADD CONSTRAINT "TeamMember_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "TeamMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "startAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Task_organizationId_status_idx" ON "Task"("organizationId", "status");
CREATE INDEX "Task_teamId_status_idx" ON "Task"("teamId", "status");
CREATE INDEX "Task_creatorId_idx" ON "Task"("creatorId");
ALTER TABLE "Task"
    ADD CONSTRAINT "Task_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Task_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Task_creatorId_fkey"
    FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "assignedUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "SubtaskStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Subtask_taskId_status_idx" ON "Subtask"("taskId", "status");
CREATE INDEX "Subtask_assignedUserId_status_idx" ON "Subtask"("assignedUserId", "status");
ALTER TABLE "Subtask"
    ADD CONSTRAINT "Subtask_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Subtask_assignedUserId_fkey"
    FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "SubtaskSubmission" (
    "id" TEXT NOT NULL,
    "subtaskId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "feedback" TEXT,
    "reviewedById" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubtaskSubmission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SubtaskSubmission_subtaskId_submittedAt_idx" ON "SubtaskSubmission"("subtaskId", "submittedAt");
ALTER TABLE "SubtaskSubmission"
    ADD CONSTRAINT "SubtaskSubmission_subtaskId_fkey"
    FOREIGN KEY ("subtaskId") REFERENCES "Subtask"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "SubtaskSubmission_submittedById_fkey"
    FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "SubtaskSubmission_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "complainantId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "teamId" TEXT,
    "taskId" TEXT,
    "subtaskId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "reviewerId" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Complaint_organizationId_status_idx" ON "Complaint"("organizationId", "status");
CREATE INDEX "Complaint_complainantId_idx" ON "Complaint"("complainantId");
CREATE INDEX "Complaint_reportedUserId_idx" ON "Complaint"("reportedUserId");
ALTER TABLE "Complaint"
    ADD CONSTRAINT "Complaint_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Complaint_complainantId_fkey"
    FOREIGN KEY ("complainantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Complaint_reportedUserId_fkey"
    FOREIGN KEY ("reportedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Complaint_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Complaint_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Complaint_subtaskId_fkey"
    FOREIGN KEY ("subtaskId") REFERENCES "Subtask"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Complaint_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "purchasedTeamCapacity" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "Payment"("stripeCheckoutSessionId");
CREATE INDEX "Payment_organizationId_status_idx" ON "Payment"("organizationId", "status");
ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "OrganizationEntitlement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "freeTeamCapacity" INTEGER NOT NULL DEFAULT 3,
    "purchasedTeamCapacity" INTEGER NOT NULL DEFAULT 0,
    "usedTeamCapacity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationEntitlement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrganizationEntitlement_organizationId_key" ON "OrganizationEntitlement"("organizationId");
ALTER TABLE "OrganizationEntitlement"
    ADD CONSTRAINT "OrganizationEntitlement_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
CREATE INDEX "Notification_organizationId_createdAt_idx" ON "Notification"("organizationId", "createdAt");
ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "Notification_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");
ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "AuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
