import { BASE_URL } from "./auth";

export const getTask = async (id)=>{
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "GET",
    headers:{
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  return res.json();
}

export const getTaskUpdates = async (data)=>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/get-taskUpdates/${data.taskId}/${data.workspaceId}`, {
    method: "GET",
    headers: {
      Authorization :`Bearer ${token}`
    }
  })
  return res.json();
}

export const getAllTaskByUserId = async (userId)=>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/all-task/${userId}`,{
    method: 'GET',
    headers:{
      Authorization: `Bearer ${token}`
    }
  })
  return res.json()
}

export const getRecentActivity = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/get-recent-activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};