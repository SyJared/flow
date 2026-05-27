import { BASE_URL } from "./auth";

export const registerUser = async (data) => {
  const res = await fetch(`http://localhost:5000/api/auth/register`, {
    method: "POST",
    headers:{
      'Content-Type': "application/json"
    },
    body: JSON.stringify(data)
  });
  return res.json();
}