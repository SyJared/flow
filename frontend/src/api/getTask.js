import { API_BASE, BASE_URL } from "./auth";

export const getTask = async (workspaceId)=>{
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/tasks/get-tasks/${workspaceId}`, {
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
  const res = await fetch(`${API_BASE}/task-update/get-updates/${data.workspaceId}/${data.taskId}`, {
    method: "GET",
    headers: {  
      Authorization :`Bearer ${token}`
    }
  })
  return res.json();
}

export const getAllTaskByUserId = async (userId)=>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/tasks/all-task/${userId}`,{
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

export const getPastDue = async()=>{
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/tasks/past-due`,{
    method: 'GET',
    headers:{
      Authorization: `Bearer ${token}`
    }
  })
  return res.json()
}
