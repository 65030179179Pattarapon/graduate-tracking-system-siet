// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
// ✅ 1. นำเข้า useLocation เพื่อเช็ค URL ปัจจุบัน
import { Outlet, useLocation } from 'react-router-dom'; 
import NavbarAdmin from '../components/admin/NavbarAdmin';
import SidebarAdmin from '../components/admin/SidebarAdmin';
import SidebarManageUser from '../components/admin/SidebarManageUser'; // ✅ 2. นำเข้า Sidebar ใหม่
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const location = useLocation(); // Hook สำหรับดูข้อมูล URL
  const [activeSection, setActiveSection] = useState('pending-review');
  const [activeUserSection, setActiveUserSection] = useState('overview');

  // ✅ 3. เช็คว่าตอนนี้อยู่ที่หน้า manage-users หรือไม่
  const isManageUserPage = location.pathname.includes('/admin/manage-users');

  return (
    <div className={styles.adminLayoutRoot}>
      <NavbarAdmin />
      <div className={styles.adminPageLayout}>
        
        {/* ✅ 4. ใช้เงื่อนไขเพื่อเลือกว่าจะแสดง Sidebar ไหน */}
        {isManageUserPage ? (
          <SidebarManageUser 
            activeSection={activeUserSection} 
            setSection={setActiveUserSection} 
          />
        ) : (
          <SidebarAdmin 
            activeSection={activeSection} 
            setSection={setActiveSection} 
            notifications={{}} // ส่งค่าว่างไปก่อน
          />
        )}

        <main className={styles.mainContent}>
          {/* ✅ 5. ส่ง State ที่ถูกต้องไปให้ Page ลูก */}
          <Outlet context={isManageUserPage ? { activeSection: activeUserSection } : { activeSection, setNotifications: () => {} }} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;