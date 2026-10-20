export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || "http://localhost:5000").replace(/\/$/, "");
export const API_BASE = `${API_ORIGIN}/api`;
export const BASE_URL = `${API_BASE}/auth`;

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getMe = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();



  return data;
};

export const saveProfilePicture = async imageData => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile-picture`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageData }),
  });
  return res.json();
};
