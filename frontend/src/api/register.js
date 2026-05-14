import { BASE_URL } from "./auth";

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers:{
      'Content-Type': "application/json"
    },
    body: JSON.stringify(data)
  });
  return res.json();
}