-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceCode" JSONB NOT NULL,
    "stderr" TEXT,
    "stdout" TEXT,
    "stdin" TEXT,
    "status" TEXT NOT NULL,
    "time" TEXT,
    "memory" TEXT,
    "compileOuput" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCasesResults" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "stderr" TEXT,
    "testCase" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "actualOutput" TEXT,
    "time" TEXT,
    "memory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCasesResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolvedProblems" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "SolvedProblems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestCasesResults_submissionId_idx" ON "TestCasesResults"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "SolvedProblems_problemId_userId_key" ON "SolvedProblems"("problemId", "userId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCasesResults" ADD CONSTRAINT "TestCasesResults_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolvedProblems" ADD CONSTRAINT "SolvedProblems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolvedProblems" ADD CONSTRAINT "SolvedProblems_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
