import { BASE_URL } from "./auth";

export const createTask = async (data)=>{
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:5000/api/tasks/create-task/${data.workspaceId}`, {
    method: "POST",
    headers:{
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...data, dueDate: data.dueDate || null })
  })
  return res.json();
}

export const updateTask = async (workspaceId, taskId, data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:5000/api/tasks/update-task/${workspaceId}/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, dueDate: data.dueDate || null }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Could not update this task.");
  return result;
};
