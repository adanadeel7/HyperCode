import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Editor from './pages/Editor.tsx'
import Login from './pages/Login.tsx'
import ProtectedRoute from './pages/ProtectedRoute.tsx'
import Dashboard from './pages/Dashboard.tsx'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/authContext.tsx'
import VerifyEmail from './pages/VerifyEmail.tsx'

function App() {
  
  const { user} : any = useAuth()

  return (
    <>
     <Toaster position="top-center" />
     <BrowserRouter>
        <Routes>
              <Route path='/' element={<Login/>}/>
              <Route path='/signup' element={<Login/>}/>
              <Route path='/verify-email' element={<VerifyEmail/>}/>
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
