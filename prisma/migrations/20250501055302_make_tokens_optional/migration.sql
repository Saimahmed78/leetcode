-- AlterTable
ALTER TABLE "User" ALTER COLUMN "verificationToken" DROP NOT NULL,
ALTER COLUMN "verificationTokenExpiry" DROP NOT NULL,
ALTER COLUMN "forgotPasswordToken" DROP NOT NULL,
ALTER COLUMN "forgotPasswordExpiry" DROP NOT NULL,
ALTER COLUMN "RefreshToken" DROP NOT NULL;
