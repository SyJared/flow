import { BASE_URL } from "./auth";

export const searchName = async (name) =>{
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/search?name=${name}`, {
    method: 'GET',
    headers:{
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
    }
  })
  return res.json();
}