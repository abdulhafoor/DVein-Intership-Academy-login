const BASE_URL = "http://127.0.0.1:8000/api/sessions";

const headers = {
  "Content-Type": "application/json",
};

export const getSessions = async () => {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok) throw new Error("Failed to fetch sessions");
  return response.json();
};

export const getSession = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch session");
  return response.json();
};

export const createSession = async (session) => {
  const response = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers,
    body: JSON.stringify(session),
  });

  if (!response.ok) throw new Error("Failed to create session");

  return response.json();
};

export const updateSession = async (id, session) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(session),
  });

  if (!response.ok) throw new Error("Failed to update session");

  return response.json();
};

export const deleteSession = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete session");

  return response.json();
};

export const completeSession = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}/complete`, {
    method: "PATCH",
  });

  if (!response.ok) throw new Error("Failed to complete session");

  return response.json();
};