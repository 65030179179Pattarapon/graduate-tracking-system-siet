import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import NavbarAdmin from '../components/admin/NavbarAdmin';
import SidebarAdmin from '../components/admin/SidebarAdmin';
import SidebarManageUser from '../components/admin/SidebarManageUser';
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('pending-review'); // สำหรับ SidebarAdmin
  const [activeUserSection, setActiveUserSection] = useState('overview'); // สำหรับ SidebarManageUser

  // --- ตรวจสอบ Path ปัจจุบัน ---
  const isManageUserPage = location.pathname === '/admin/manage-users';
  const isStudentDetailPage = location.pathname.startsWith('/admin/manage-users/student/');
  const isAdvisorDetailPage = location.pathname.startsWith('/admin/manage-users/advisor/');
  const isManageStructurePage = location.pathname.startsWith('/admin/structures');
  const isSettingsPage = location.pathname.startsWith('/admin/settings');
  // ✅ 1. เพิ่มตัวแปรสำหรับตรวจสอบหน้า "โปรไฟล์"
  const isAdminProfilePage = location.pathname.startsWith('/admin/profile');

  // ✅ 2. อัปเดตเงื่อนไขการแสดง Sidebar หลัก
  // Sidebar หลักจะแสดงเมื่อ "ไม่ใช่" หน้าเหล่านี้ทั้งหมด
  const showMainSidebar = !isManageUserPage && !isStudentDetailPage && !isAdvisorDetailPage && !isManageStructurePage && !isSettingsPage && !isAdminProfilePage;

  // Sidebar ของหน้าจัดการผู้ใช้งานจะแสดงเมื่อเป็นหน้า '/admin/manage-users' เท่านั้น
  const showManageUserSidebar = isManageUserPage; 


  return (
    <div className={styles.adminLayoutRoot}>
      <NavbarAdmin />
      <div className={styles.adminPageLayout}>
        
        {/* แสดง Sidebar ของหน้าจัดการผู้ใช้งาน */}
        {showManageUserSidebar && (
          <SidebarManageUser 
            activeSection={activeUserSection} 
            setSection={setActiveUserSection} 
          />
        )}

        {/* แสดง Sidebar หลัก (Home) */}
        {showMainSidebar && (
          <SidebarAdmin 
            activeSection={activeSection} 
            setSection={setActiveSection} 
            notifications={{}} // คุณอาจจะต้องส่งค่า notifications จริงๆ ไป
          />
        )}
        
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