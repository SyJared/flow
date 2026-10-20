import Login from './features/auth/login'
import LoggedIn from './pages/logged'
import { Navigate, Route, Routes } from 'react-router-dom'
import Register from './pages/register'
import WorkspacePage from './pages/workspacePage'
import Header from './features/header/header'

import TasksPage from './pages/taskpage'
import DashboardPage from './pages/dashboard'
import TeamsPage from './pages/teams'
import ProfilePage from './pages/profile'
import SettingsPage from './pages/settings'
import { useAuth } from './features/auth/authContext'
import { getPreferences } from './utils/preferences'

function HomeRedirect() {
  const { user, userLoading } = useAuth();
  if (userLoading) return null;
  const destination = user ? `/${getPreferences(user.id).landingPage}` : "/login";
  return <Navigate to={destination} replace />;
}

function GuestOnly({ children }) {
  const { user, userLoading } = useAuth();
  if (userLoading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}


function App() {
  return (
    <>
<Header />
<Routes>

  <Route path='/dashboard' element={<DashboardPage />} />
  <Route path='/teams' element={<TeamsPage />} />
  <Route path='/profile' element={<ProfilePage />} />
  <Route path='/settings' element={<SettingsPage />} />
  <Route path='/workspace/tasks/:userId' element={<TasksPage/>} />
  <Route path='/workspace/:id' element={<WorkspacePage />} />
  <Route path='/register' element={<Register />} />
  <Route path="/" element={<HomeRedirect />} />
  <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
  <Route path="/logged" element={<LoggedIn />} />
</Routes>
    </>
  )
}

export default App
