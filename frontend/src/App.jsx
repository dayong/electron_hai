import React from 'react';
import { Routes, Route } from 'react-router-dom'
import MainLayout from "./components/layout/MainLayout";
import Home from './components/Home/Home'

import CompanyPosition from './components/CompanyPosition/CompanyPosition'
import PositionList from './components/CompanyPosition/PositionList'
import PositionDetail from './components/CompanyPosition/PositionDetail'
import CPCreateCompany from './components/CompanyPosition/CPCreateCompany'
import CPCreatePosition from './components/CompanyPosition/CPCreatePosition'

import Employee from './components/Employee/Employee'
import EmployeeCreate from './components/Employee/EmployeeCreate'

import ResumeList from './components/Resume/List'
import Tools from './components/Tools/Default'
import Setup from './components/Setup'
import Login from './components/Login'
import Register from './components/Register'


const App = () => {
  return (
      <Routes>
        {/* 无需布局的页面（单独显示） */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 后台主布局（含左侧菜单） */}
        <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/tools" element={<Tools />} />       

            <Route path="/employee" element={<Employee />} />
            <Route path="/create_employee" element={<EmployeeCreate />} />

            <Route path="/resume" element={<ResumeList />} />

            <Route path="/company_position" element={<CompanyPosition />} />
            <Route path="/position_list" element={<PositionList />} />
            <Route path="/position_detail/:positionID" element={<PositionDetail />} />
            <Route path="/cp_create_company" element={<CPCreateCompany />} />
            <Route path="/cp_create_position" element={<CPCreatePosition />} />
          
          
            <Route path="/setup" element={<Setup />} />
        </Route>
      </Routes>
  );
};
export default App;
