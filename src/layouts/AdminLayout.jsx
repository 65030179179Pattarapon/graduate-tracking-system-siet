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

  // ✅ 1. ตรวจสอบ Path สำหรับหน้ารายละเอียดอาจารย์
  const isManageUserPage = location.pathname === '/admin/manage-users';
  const isStudentDetailPage = location.pathname.startsWith('/admin/manage-users/student/');
  const isAdvisorDetailPage = location.pathname.startsWith('/admin/manage-users/advisor/'); // 👈 เพิ่มบรรทัดนี้

  // Sidebar หลัก (SidebarAdmin) จะแสดงเมื่อไม่ใช่หน้า "จัดการผู้ใช้งาน" และไม่ใช่หน้ารายละเอียดใดๆ
  const showMainSidebar = !isManageUserPage && !isStudentDetailPage && !isAdvisorDetailPage; // 👈 แก้ไขเงื่อนไข

  // Sidebar ของหน้าจัดการผู้ใช้งาน (SidebarManageUser) จะแสดงเมื่อเป็นหน้า '/admin/manage-users' เท่านั้น
  // และไม่แสดงในหน้ารายละเอียดนักศึกษาหรืออาจารย์
  const showManageUserSidebar = isManageUserPage; 


  return (
    <div className={styles.adminLayoutRoot}>
      <NavbarAdmin />
      <div className={styles.adminPageLayout}>
        
        {/* ✅ 2. ปรับเงื่อนไขการแสดง SidebarManageUser */}
        {showManageUserSidebar && (
          <SidebarManageUser 
            activeSection={activeUserSection} 
            setSection={setActiveUserSection} 
          />
        )}

        {/* ✅ 3. ปรับเงื่อนไขการแสดง SidebarAdmin */}
        {showMainSidebar && (
          <SidebarAdmin 
            activeSection={activeSection} 
            setSection={setActiveSection} 
            notifications={{}} // คุณอาจจะต้องส่งค่า notifications จริงๆ ไป
          />
        )}
        
        {/* ถ้าเป็นหน้ารายละเอียดนักศึกษา (isStudentDetailPage) 
            หรือหน้ารายละเอียดอาจารย์ (isAdvisorDetailPage) 
            ส่วนนี้จะไม่แสดง Sidebar ใดๆ เลย */}

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