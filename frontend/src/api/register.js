import { API_BASE } from "./auth";

export const registerUser = async (data) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers:{
      'Content-Type': "application/json"
    },
    body: JSON.stringify(data)
  });
  return res.json();
}
