const BASE_URL = "http://127.0.0.1:8000/api/mentor";

const headers = {
  "Content-Type": "application/json",
};

export const sendMessage = async (message) => {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message }),
  });

  if (!response.ok) throw new Error("Failed to send message");

  return response.json();
};

export const getProgress = async () => {
  const response = await fetch(`${BASE_URL}/progress`);

  if (!response.ok) throw new Error("Failed to fetch progress");

  return response.json();
};

export const getAssessments = async () => {
  const response = await fetch(`${BASE_URL}/assessments`);

  if (!response.ok) throw new Error("Failed to fetch assessments");

  return response.json();
};

export const getRecommendations = async () => {
  const response = await fetch(`${BASE_URL}/recommendations`);

  if (!response.ok) throw new Error("Failed to fetch recommendations");

  return response.json();
};

export const submitAssessment = async (assessmentId) => {
  const response = await fetch(
    `${BASE_URL}/assessment/${assessmentId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) throw new Error("Failed to submit assessment");

  return response.json();
};