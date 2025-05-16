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
  // get data from req.body
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
  // extract language and solutionCode from referenceSolutions
  for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
    const languageId = getjudge0Languageid(language);
    // find langauge id of each language
    if (!languageId) {
      throw new ApiError(400, `Unsupported language: ${language}`);
    }

    const submissions = testcases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    const tokens = await submitBatch(submissions);
    if (!tokens) {
      throw new ApiError("tokens not found");
    }

    // polls until each has status.id > 2

    const results = await pollBatchResult(tokens);
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
});

export { createProblem };
