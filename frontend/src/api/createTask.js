import { BASE_URL } from "./auth";

export const createTask = async (data)=>{
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:5000/api/tasks/create-task/${data.workspaceId}`, {
    method: "POST",
    headers:{
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return res.json();
}