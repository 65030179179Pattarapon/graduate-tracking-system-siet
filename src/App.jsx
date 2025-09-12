import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Layouts ---
import UserLayout from './layouts/UserLayout'; 

// --- Public Pages ---
import LoginPage from './pages/Auth_Page/Login';

// --- Student Pages ---
import SignaturePage from './pages/User_Page/SignaturePage';
import HomePage from './pages/User_Page/HomePage'; 
import StatusPage from './pages/User_Page/StatusPage';
import DocumentDetailPage from './pages/User_Page/DocumentDetailPage';
import Form1Page from './pages/User_Page/Form1Page';
import Form2Page from './pages/User_Page/Form2Page';
import Form3Page from './pages/User_Page/Form3Page';
import Form4Page from './pages/User_Page/Form4Page';
import Form5Page from './pages/User_Page/Form5Page';
import Form6Page from './pages/User_Page/Form6Page';
import ExamSubmitPage from './pages/User_Page/ExamSubmitPage';
import TemplatesPage from './pages/User_Page/TemplatesPage';

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signature" element={<SignaturePage />} />

      {/* --- Student Protected Routes (all under UserLayout) --- */}
      <Route path="/student" element={<UserLayout />}>
        <Route index element={<Navigate replace to="home" />} /> 
        <Route path="home" element={<HomePage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="form1" element={<Form1Page />} />
        <Route path="form2" element={<Form2Page />} />
        <Route path="form3" element={<Form3Page />} />
        <Route path="form4" element={<Form4Page />} />
        <Route path="form5" element={<Form5Page />} />
        <Route path="form6" element={<Form6Page />} />
        <Route path="exam-submit" element={<ExamSubmitPage />} />
        
        {/* Dynamic Route for Document Details */}
        <Route path="docs/:docId" element={<DocumentDetailPage />} />
        
        {/* 👇 เพิ่มบรรทัดนี้เข้าไปสำหรับหน้าดาวน์โหลดเอกสาร */}
        <Route path="templates" element={<TemplatesPage />} />

      </Route>
      
      {/* You can add routes for other roles like Admin here in the future */}
      {/* <Route path="/admin" element={<AdminLayout />}>
        ...
      </Route> 
      */}

    </Routes>
  );
}

export default App;