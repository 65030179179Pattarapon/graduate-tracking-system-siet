import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // เราจะสร้างไฟล์นี้ต่อไป
import styles from './UserLayout.module.css'; // สร้างไฟล์ CSS คู่กัน

function UserLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // --- ส่วนที่แก้ไข: เพิ่ม state สำหรับเก็บข้อมูลทั้งหมด ---
  const [userData, setUserData] = useState({ 
    name: 'กำลังโหลด...', 
    email: '', 
    studentId: '' 
  });
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('current_user_name');
    const email = localStorage.getItem('current_user');
    const studentId = localStorage.getItem('student_id');

    if (name && email && studentId) {
      setUserData({ name, email, studentId });
    }   
  }, []);

  const handleLogout = () => {
    // เคลียร์ข้อมูลผู้ใช้ออกจาก Local Storage
    localStorage.removeItem('current_user');
    localStorage.removeItem('role');
    localStorage.removeItem('current_user_name');
    // อื่นๆ ที่เกี่ยวข้องกับการ login
    navigate('/login');
  };

  return (
    <div className={styles.userLayout}>
      {/* --- ส่วนที่แก้ไข: ส่ง userData ทั้ง object ไปเป็น prop --- */}
      <Navbar 
        userData={userData} 
        onLogoutClick={() => setIsModalOpen(true)} 
      />
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Logout Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>ยืนยันการออกจากระบบ</h3>
            <p>คุณต้องการออกจากระบบใช่หรือไม่?</p>
            <div className={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)} className={styles.btnSecondary}>ยกเลิก</button>
              <button onClick={handleLogout} className={styles.btnDanger}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserLayout;