import { db } from "../db/db.js";
import {
  getjudge0LanguageName,
  pollBatchResult,
  submitBatch,
} from "../db/problem.libs.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynchandler.js";

export const codeExecution = asyncHandler(async (req, res) => {
  const { source_code, language_id, stdin, expected_outputs, problemId } =
    req.body;
  console.log(problemId);
  if (
    !Array.isArray(stdin) ||
    !Array.isArray(expected_outputs) ||
    stdin.length === 0 ||
    stdin.length !== expected_outputs.length
  )
    throw new ApiError(400, "Missing or Invalide testcases");

  const submissions = stdin.map((input) => ({
    source_code,
    language_id,
    stdin: input,
  }));
  const submitResponse = await submitBatch(submissions);
  console.log(submitResponse);
  const result = await pollBatchResult(submitResponse);
  console.dir(result);
  let allPassed = true;
  const detailedresult = result.map((result, i) => {
    const stdout = result.stdout.trim();
    const expectedOutput = expected_outputs[i]?.trim();
    let passed = stdout == expectedOutput;

    if (!passed) allPassed = false;
    return {
      testCase: i + 1,
      stderr: result.stderr || null,
      status: result.status.description,
      passed,
      expectedOutput,
      actualOutput: stdout,
      time: result.time ? `${result.time} s` : undefined,
      memory: result.memory ? `${result.memory} KB` : undefined,
      compileOuput: result.compile_ouput || undefined,
    };
  });
  let userId = req.user.id;
  const submission = await db.submission.create({
    data: {
      problemId,
      userId,
      language: getjudge0LanguageName(language_id),
      sourceCode: source_code,
      stderr: detailedresult.some((result) => result.stderr)
        ? JSON.stringify(detailedresult.map((result) => result.stderr))
        : null,
      stdout: detailedresult.stdout,
      stdin: stdin.join("/n"),
      status: allPassed ? "Accepted" : "WrongAnswer",
      time: detailedresult.some((result) => result.time)
        ? JSON.stringify(detailedresult.map((result) => result.time))
        : null,
      memory: detailedresult.some((result) => result.memory)
        ? JSON.stringify(detailedresult.map((result) => result.memory))
        : null,
      compileOuput: detailedresult.some((result) => result.compile_ouput)
        ? JSON.stringify(detailedresult.map((result) => result.compile_ouput))
        : null,
    },
  });
  if (allPassed) {
    await db.SolvedProblems.upsert({
      where: {
        problemId_userId: {
          problemId,
          userId,
        },
      },
      update: {},
      create: {
        userId,
        problemId,
      },
    });
  }
  const testCasesResults = detailedresult.map((result) => ({
    submissionId: submission.id,
    testCase: result.testCase,
    stderr: result.stderr,
    status: result.status,
    passed: result.passed,
    expectedOutput: result.expectedOutput,
    actualOutput: result.actualOutput,
    time: result.time,
    memory: result.memory,
    compileOutput: result.compileOutput,
  }));
  await db.TestCasesResults.createMany({
    data: testCasesResults,
  });
  const submissionswithTestCases = await db.submission.findUnique({
    where: { id: submission.id },
    include: { testcases: true },
  });
  return res.json(
    new ApiResponse(200, "Solution Submitted", submissionswithTestCases),
  );
});
