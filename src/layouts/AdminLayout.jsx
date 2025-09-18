// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavbarAdmin from '../components/admin/NavbarAdmin';
import SidebarAdmin from '../components/admin/SidebarAdmin';
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const [activeSection, setActiveSection] = useState('pending-review');
  // ✅ 1. เพิ่ม State สำหรับเก็บข้อมูลการแจ้งเตือน
  const [notifications, setNotifications] = useState({});

  // ✅ 2. สร้างฟังก์ชันสำหรับอัปเดตเวลาที่เข้าดูล่าสุด
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // บันทึกเวลาปัจจุบันลง localStorage ว่าเราได้เข้ามาดูหน้านี้แล้ว
    localStorage.setItem(`lastVisited_${sectionId}`, new Date().toISOString());
    // อัปเดต State เพื่อลบจุดแดงออกทันที
    setNotifications(prev => ({ ...prev, [sectionId]: false }));
  };

  return (
    <div className={styles.adminLayoutRoot}>
      <NavbarAdmin />
      <div className={styles.adminPageLayout}>
        {/* ✅ 3. ส่ง State และฟังก์ชันใหม่ไปให้ Sidebar */}
        <SidebarAdmin 
          activeSection={activeSection} 
          setSection={handleSectionChange} 
          notifications={notifications}
        />
        <main className={styles.mainContent}>
          {/* ✅ 4. ส่งฟังก์ชัน setNotifications ให้หน้า Home Page */}
          <Outlet context={{ activeSection, setNotifications }} />
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;