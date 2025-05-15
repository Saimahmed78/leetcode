import { db } from "../db/db.js";
import {
  getjudge0Languageid,
  pollBatchResult,
  submitBatch,
} from "../db/problem.libs.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynchandler.js";

const createProblem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficult,
    constraints,
    examples,
    hints,
    editorial,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getjudge0Languageid(language);
      if (!languageId) {
        throw new ApiError(400, `Unsupported language: ${language}`);
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      // returns string[] of tokens (never undefined now)
      const tokens = await submitBatch(submissions);

      // polls until each has status.id > 2
      const results = await pollBatchResult(tokens);

      // ensure every test passed
      // results.forEach((r, idx) => {
      for (let i = 0; i < results.length; i++) {
        let result = results[i];
        console.log(result)
        if (result.status.id !== 3) {
          throw new ApiError(
            400,
            `Testcase ${idx + 1} failed for ${language}: ${r.status.description}`,
          );
        }
      }

      console.log(`✅ All testcases passed for language: ${language}`);
    }

    const newProblem = await db.Problem.create({
      data: {
        title,
        description,
        difficult,
        constraints,
        examples,
        hints,
        editorial,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Problem Created Successfully", newProblem));
  } catch (error) {
    console.error("Failure in creation of Problem:", error);

    throw new ApiError(
      error.statusCode || 400,
      "Failure in creation of Problem",
      error.errors || error.message,
    );
  }
});

export { createProblem };
