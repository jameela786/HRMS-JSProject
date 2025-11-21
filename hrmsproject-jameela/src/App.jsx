import { useState } from 'react'
import { Routes,Route } from 'react-router-dom'
import Login from './pages/Login'
import RegisterOrg from './pages/RegisterOrg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
        <Route exact path="/login" element={<Login />}/>
        <Route exact path="/register" element={<RegisterOrg />} />
    </Routes>
  )
}

export default App
