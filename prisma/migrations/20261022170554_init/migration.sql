-- DropIndex
DROP INDEX "organization_status_idx";

-- DropIndex
DROP INDEX "organizationId_userId_index";

-- DropIndex
DROP INDEX "organization_members_status_idx";

-- CreateIndex
CREATE INDEX "organization_members_organizationId_status_idx" ON "organization_members"("organizationId", "status");

-- RenameIndex
ALTER INDEX "email_accountType_index" RENAME TO "email_role_index";
