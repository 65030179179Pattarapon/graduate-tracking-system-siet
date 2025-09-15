import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavbarAdmin from '../components/admin/NavbarAdmin';
import SidebarAdmin from '../components/admin/SidebarAdmin';
import styles from './AdminLayout.module.css';

function AdminLayout() {
  // --- ✅ นี่คือส่วนที่แก้ไข ---
  // เปลี่ยนค่าเริ่มต้นจาก 'dashboard' เป็น 'pending-review'
  const [activeSection, setActiveSection] = useState('pending-review');
  // --- จบส่วนที่แก้ไข ---

  return (
    <div className={styles.adminLayoutRoot}>
      <NavbarAdmin />
      <div className={styles.adminPageLayout}>
        <SidebarAdmin activeSection={activeSection} setSection={setActiveSection} />
        <main className={styles.mainContent}>
          <Outlet context={{ activeSection, setActiveSection }} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;