/*
  Warnings:

  - A unique constraint covering the columns `[forgotPasswordToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[RefreshToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_forgotPasswordToken_key" ON "User"("forgotPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_RefreshToken_key" ON "User"("RefreshToken");
