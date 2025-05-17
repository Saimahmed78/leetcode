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

const getAllProblems = asyncHandler(async (req, res) => {
  // find all problems
  const problems = await db.Problem.findMany();
  //check if problems exist
  if (!problems) {
    throw new ApiError(404, "No problem found");
  }
  return res.json(new ApiResponse(200, "All Problems fetched Successfully"));
});
const getProblemById = asyncHandler(async (req, res) => {
  // get id form params
  const { id } = req.params;
  const problem = await db.Problem.findUnique({ where: { id } });
  //check if problems exist
  if (!problem) {
    throw new ApiError(404, "No problem found");
  }
  return res.json(
    new ApiResponse(200, "Problem fetched Successfully", problem),
  );
});
const deleteProblem = asyncHandler(async (req, res) => {
  // get id form params
  const { id } = req.params;
  const problemToBefind = await db.Problem.findUnique({ where: { id } });
  //check if problems exist
  if (!problemToBefind) {
    throw new ApiError(404, "No problem found");
  }
  const problemToBeDeleted = await db.Problem.delete({ where: { id } });

  return res.json(
    new ApiResponse(200, "Problem Deleted Successfully", problemToBeDeleted),
  );
});
const updateProblem = asyncHandler(async (req, res) => {
  //  get problem id from req.params
  const { id } = req.params;
  // get content from req.body
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
  console.log(referenceSolutions);
  // find problem by id
  const problem = await db.Problem.findUnique({ where: { id } });
  let testcase = problem.testcases;
  if (!problem) {
    throw new ApiError(400, "Problem Not found");
  }
  //  check what the user wants to update

  const arrbody = Object.keys(req.body);

  let updatedProblem = {};
  let dataToBeUpdated = {};

  if (!req.body.referenceSolutions) {
    for (let key of arrbody) {
      dataToBeUpdated[key] = req.body[key];
    }
  } else if (req.body.referenceSolutions) {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      try {
        const languageId = getjudge0Languageid(language);
        // find langauge id of each language
        if (!languageId) {
          throw new ApiError(400, `Unsupported language: ${language}`);
        }

        const submissions = testcase.map(({ input, output }) => ({
          source_code: solutionCode,
          language_id: languageId,
          stdin: input,
          expected_output: output,
        }));

        const tokens = await submitBatch(submissions);
        if (!tokens) {
          throw new ApiError(404, "tokens not found");
        }

        // polls until each has status.id > 2

        const results = await pollBatchResult(tokens);
      } catch (error) {
        throw new ApiError(400, "Error in judge0", error);
      }
    }
    dataToBeUpdated["referenceSolutions"] = referenceSolutions;
  } else {
    throw new ApiError(404, "Nothing to Update");
  }
  try {
    updatedProblem = await db.Problem.update({
      where: { id },
      data: dataToBeUpdated,
    });
  } catch (error) {
    throw new ApiError(400, "Error in updating problem", error);
  }
  return res.json(
    new ApiResponse(200, "Problem updated Successfully", updatedProblem),
  );
});
const getProblemsSavedByUser = asyncHandler(async (req, res) => {});

export {
  createProblem,
  getAllProblems,
  getProblemById,
  deleteProblem,
  updateProblem,
};
