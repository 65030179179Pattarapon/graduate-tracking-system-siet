import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Layouts ---
import UserLayout from './layouts/UserLayout'; 
import AdminLayout from './layouts/AdminLayout';

// --- Public Pages ---
import LoginPage from './pages/Auth_Page/Login';

// --- Student & User Pages ---
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
import ProfilePage from './pages/User_Page/ProfilePage';

// --- Admin Pages ---
import AdminHomePage from './pages/Admin_Page/AdminHomePage';
import AdminProfilePage from './pages/Admin_Page/AdminProfilePage';
import AdminDocumentDetailPage from './pages/Admin_Page/AdminDocumentDetailPage';
// ✅ 1. นำเข้า Component หน้าจัดการผู้ใช้งาน
import ManageUsersPage from './pages/Admin_Page/ManageUsersPage';


function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />

      {/* --- Student Routes (Nested under UserLayout) --- */}
      <Route path="/student" element={<UserLayout />}>
        <Route index element={<Navigate replace to="home" />} /> 
        <Route path="home" element={<HomePage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="signature" element={<SignaturePage />} />
        <Route path="form1" element={<Form1Page />} />
        <Route path="form2" element={<Form2Page />} />
        <Route path="form3" element={<Form3Page />} />
        <Route path="form4" element={<Form4Page />} />
        <Route path="form5" element={<Form5Page />} />
        <Route path="form6" element={<Form6Page />} />
        <Route path="exam-submit" element={<ExamSubmitPage />} />
        <Route path="docs/:docId" element={<DocumentDetailPage />} />
      </Route>
      
      {/* --- Admin Routes (Nested under AdminLayout) --- */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate replace to="home" />} />
        <Route path="home" element={<AdminHomePage />} />
        {/* ✅ 2. เพิ่ม Route สำหรับหน้าจัดการผู้ใช้งาน */}
        <Route path="manage-users" element={<ManageUsersPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="docs/:docId" element={<AdminDocumentDetailPage />} />
      </Route>

    </Routes>
  );
}

export default App;
