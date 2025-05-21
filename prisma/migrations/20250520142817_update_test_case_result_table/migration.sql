/*
  Warnings:

  - Added the required column `compileOutput` to the `TestCasesResults` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestCasesResults" ADD COLUMN     "compileOutput" TEXT NOT NULL;
