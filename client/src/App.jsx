import './App.css'
import { BrowserRouter, Routes,Route } from 'react-router'
import Room from './pages/Room.jsx'
import Editor from './pages/Editor.jsx'

function App() {
  

  return (
    <>
     <BrowserRouter>
        <Routes>
              <Route path='/' element={<Room/>}/>
              <Route path='/editor/:roomId' element={<Editor/>}/>
  
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
