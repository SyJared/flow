import { useState } from 'react'


import Login from './features/auth/login'
import LoggedIn from './pages/logged'
import { Navigate, Route, Routes } from 'react-router-dom'
import Register from './pages/register'
import WorkspacePage from './pages/workspacePage'
import Header from './features/header/header'

import TasksPage from './pages/taskpage'

function App() {
  

  return (
    <>
<Header />
<Routes>
  <Route path='/workspace/tasks/:userId' element={<TasksPage/>} />
  <Route path='/workspace/:id' element={<WorkspacePage />} />
  <Route path='/register' element={<Register />} />
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="/login" element={<Login />} />
  <Route path="/logged" element={<LoggedIn />} />
</Routes>
    </>
  )
}

export default App
