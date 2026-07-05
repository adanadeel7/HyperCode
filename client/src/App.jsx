import './App.css'
import { BrowserRouter, Routes,Route } from 'react-router-dom'
import Room from './pages/Room.jsx'
import Editor from './pages/Editor.jsx'
import Login from './pages/Login.jsx'
import ProtectedRoute from './pages/ProtectedRoute.jsx'
import Dashboard from './pages/Dashboard.jsx'

import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/authContext.jsx'

function App() {
  const { user } = useAuth()

  return (
    <>
     <Toaster position="top-center" />
     <BrowserRouter>
        <Routes>
              <Route path='/' element={<Login/>}/>
              <Route path='/signup' element={<Login/>}/>
              <Route path='/room' 
              element={
              <ProtectedRoute user={user}>
                <Dashboard/>
              </ProtectedRoute>
              }
              />
              <Route path='/editor/:roomId' element={
                <ProtectedRoute user={user}>
                <Editor/>
              </ProtectedRoute>
              }/>
  
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
