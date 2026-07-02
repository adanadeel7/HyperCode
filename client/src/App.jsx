import './App.css'
import { BrowserRouter, Routes,Route } from 'react-router'
import Room from './pages/Room.jsx'
import Editor from './pages/Editor.jsx'
import Login from './pages/Login.jsx'

function App() {
  

  return (
    <>
     <BrowserRouter>
        <Routes>
              <Route path='/' element={<Login/>}/>
              <Route path='/signup' element={<Login/>}/>
              <Route path='/room' element={<Room/>}/>
              <Route path='/editor/:roomId' element={<Editor/>}/>
  
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
