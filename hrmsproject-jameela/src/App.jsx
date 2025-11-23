import { useState } from 'react'
import { Routes,Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RegisterOrg from './pages/RegisterOrg'
import Employees from './pages/Employees'
import EmployeeAdd from './pages/EmployeeAdd'
import EmployeeEdit from './pages/EmployeeEdit'
import Teams from './pages/Teams'
import TeamAdd from './pages/TeamAdd'
import TeamEdit from './pages/TeamEdit'
import Logs from './pages/Logs'

function App() {

  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route exact path="/login" element={<Login />}/>
        <Route exact path="/dashboard" element={<Dashboard />} />
        <Route exact path="/register" element={<RegisterOrg />} />
        <Route exact path="/employees" element={<Employees />} />
        <Route exact path="/employees/add" element={<EmployeeAdd />} />
        <Route exact path="/employees/edit/:id" element={<EmployeeEdit />} />
        
        <Route exact path="/teams" element={<Teams />} />
        <Route exact path="/teams/add" element={<TeamAdd />} />
        <Route exact path="/teams/edit/:id" element={<TeamEdit />} />

        <Route path="/logs" element={<Logs />} />


    </Routes>
  )
}

export default App
