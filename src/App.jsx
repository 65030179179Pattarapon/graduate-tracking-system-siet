import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth_Page/Login';
import SignaturePage from './pages/User_Page/SignaturePage'; // <-- 1. นำเข้าหน้า Signature

// ... (import Layouts และ Pages อื่นๆ) ...

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* 2. เพิ่ม Route สำหรับหน้าลายเซ็น */}
      <Route path="/signature" element={<SignaturePage />} />

      {/* ... (Routes อื่นๆ ของคุณ) ... */}
    </Routes>
  );
}

export default App;