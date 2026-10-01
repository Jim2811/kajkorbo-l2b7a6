/*
  Warnings:

  - You are about to drop the column `accountType` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "email_accountType_index";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "accountType",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "AccountType";

-- CreateIndex
CREATE INDEX "email_accountType_index" ON "users"("email", "role");
