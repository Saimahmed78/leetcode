import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { ApiError } from "../utils/ApiError.js";

export const getjudge0Languageid = (language) => {
  const languageMap = {
    JAVA: 61,
    PYTHON: 71,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  const endpoint = `${process.env.JUDGE0_API_URL}/submissions/batch`;

  const headers = {
    "Content-Type": "application/json",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": process.env.RAPIDAPI_HOST,
  };

  try {
    const { data } = await axios.post(endpoint, { submissions }, { headers });
    return data.map((entry) => entry.token);
  } catch (err) {
    throw new ApiError(
      502,
      "Failed to submit to Judge0",
      err.response?.data || err.message,
    );
  }
};
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

export const pollBatchResult = async (tokens) => {
  const headers = {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": process.env.RAPIDAPI_HOST,
  };

  const { data } = await axios.get(
    `${process.env.JUDGE0_API_URL}/submissions/batch`,
    {
      params: {
        tokens: tokens.join(","),
      },
      headers,
      timeout: 15000,
    },
  );

  return data.submissions;
};
