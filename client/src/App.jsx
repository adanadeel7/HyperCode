import './App.css'
import { BrowserRouter, Routes,Route } from 'react-router-dom'
import Room from './pages/Room.jsx'
import Editor from './pages/Editor.jsx'
import Login from './pages/Login.jsx'
import ProtectedRoute from './pages/ProtectedRoute.jsx'

function App() {
  

  return (
    <>
     <BrowserRouter>
        <Routes>
              <Route path='/' element={<Login/>}/>
              <Route path='/signup' element={<Login/>}/>
              <Route path='/room' 
              element={
              <ProtectedRoute user={user}>
                <Room/>
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
