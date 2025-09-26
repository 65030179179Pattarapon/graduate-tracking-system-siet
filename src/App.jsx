import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Layouts ---
// ✅ แก้ไข: เปลี่ยนเป็น Relative Path
import UserLayout from './layouts/UserLayout'; 
import AdminLayout from './layouts/AdminLayout';

// --- Public Pages ---
// ✅ แก้ไข: เปลี่ยนเป็น Relative Path
import LoginPage from './pages/Auth_Page/Login';

// --- Student & User Pages ---
// ✅ แก้ไข: เปลี่ยนเป็น Relative Path ทั้งหมด
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
// ✅ แก้ไข: เปลี่ยนเป็น Relative Path ทั้งหมด
import AdminHomePage from './pages/Admin_Page/AdminHomePage';
import AdminProfilePage from './pages/Admin_Page/AdminProfilePage';
import AdminDocumentDetailPage from './pages/Admin_Page/AdminDocumentDetailPage';
import ManageUsersPage from './pages/Admin_Page/ManageUsersPage';
import ManageStudentDetailPage from './pages/Admin_Page/ManageStudentDetailPage';
import AddStudentPage from './pages/Admin_Page/AddStudentPage'; 
import ManageAdvisorDetailPage from './pages/Admin_Page/ManageAdvisorDetailPage';
import AddAdvisorPage from './pages/Admin_Page/AddAdvisorPage';
import ManageStructurePage from './pages/Admin_Page/ManageStructurePage';
import SettingsPage from './pages/Admin_Page/SettingsPage';


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
        <Route path="structures" element={<ManageStructurePage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* จัดกลุ่ม Route ที่เกี่ยวกับการจัดการผู้ใช้งาน */}
        <Route path="manage-users">
            <Route index element={<ManageUsersPage />} />
            {/* Routes สำหรับนักศึกษา */}
            <Route path="student">
                <Route path="new" element={<AddStudentPage />} />
                <Route path=":studentId" element={<ManageStudentDetailPage />} />
            </Route>
            {/* Routes สำหรับอาจารย์ */}
            <Route path="advisor">
                <Route path="new" element={<AddAdvisorPage />} />
                <Route path=":advisorId" element={<ManageAdvisorDetailPage />} />
            </Route>
        </Route>

        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="docs/:docId" element={<AdminDocumentDetailPage />} />
      </Route>

    </Routes>
  );
}

export default App;

