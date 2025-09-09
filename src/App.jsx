import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth_Page/Login';
import SignaturePage from './pages/User_Page/SignaturePage';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/User_Page/HomePage';
import StatusPage from './pages/User_Page/StatusPage';
import Form1Page from './pages/User_Page/Form1Page';
import Form2Page from './pages/User_Page/Form2Page';
import DocumentDetailPage from './pages/User_Page/DocumentDetailPage'; // ตรวจสอบว่า import เข้ามาแล้ว

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signature" element={<SignaturePage />} />

      {/* --- Student Protected Routes --- */}
      <Route path="/student" element={<UserLayout />}>
        <Route index element={<Navigate replace to="home" />} /> 
        <Route path="home" element={<HomePage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="form1" element={<Form1Page />} />
        <Route path="form2" element={<Form2Page />} />
        <Route path="docs/:docId" element={<DocumentDetailPage />} />

      </Route>
      
    </Routes>
  );
}

export default App;

