import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import NavbarAdmin from '../components/admin/NavbarAdmin';
import SidebarAdmin from '../components/admin/SidebarAdmin';
import SidebarManageUser from '../components/admin/SidebarManageUser';
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('pending-review');
  const [activeUserSection, setActiveUserSection] = useState('overview');

  // ✅ 1. ตรวจสอบ Path แบบเจาะจงมากขึ้น
  // เช็คว่าเป็นหน้า "จัดการผู้ใช้งาน" (แต่ไม่ใช่หน้ารายละเอียด)
  const isManageUserPage = location.pathname === '/admin/manage-users';
  // เช็คว่าเป็นหน้ารายละเอียดของนักศึกษาหรือไม่
  const isStudentDetailPage = location.pathname.startsWith('/admin/manage-users/student/');
  
  // Sidebar หลักจะแสดงเมื่อไม่ใช่ทั้ง 2 กรณีข้างต้น
  const showMainSidebar = !isManageUserPage && !isStudentDetailPage;

  return (
    <div className={styles.adminLayoutRoot}>
      <NavbarAdmin />
      <div className={styles.adminPageLayout}>
        
        {/* ✅ 2. ใช้เงื่อนไขที่แม่นยำขึ้นในการแสดงผล */}
        {isManageUserPage && (
          <SidebarManageUser 
            activeSection={activeUserSection} 
            setSection={setActiveUserSection} 
          />
        )}

        {showMainSidebar && (
          <SidebarAdmin 
            activeSection={activeSection} 
            setSection={setActiveSection} 
            notifications={{}}
          />
        )}
        
        {/* ถ้าเป็นหน้ารายละเอียดนักศึกษา (isStudentDetailPage) ส่วนนี้จะไม่แสดง Sidebar ใดๆ เลย */}

        <main className={styles.mainContent}>
          {/* Outlet จะ render Page Component ที่เรากำหนดใน App.jsx */}
          <Outlet context={isManageUserPage ? 
            { activeSection: activeUserSection, setActiveSection: setActiveUserSection } : 
            { activeSection, setNotifications: () => {} }} 
          />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;