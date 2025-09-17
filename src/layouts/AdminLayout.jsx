// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavbarAdmin from '../components/admin/NavbarAdmin';
import SidebarAdmin from '../components/admin/SidebarAdmin';
import styles from './AdminLayout.module.css'; // ตรวจสอบว่า import เข้ามา

function AdminLayout() {
  const [activeSection, setActiveSection] = useState('pending-review');

  return (
    // คลาสสำหรับกรอบนอกสุด
    <div className={styles.adminLayoutRoot}>
      <NavbarAdmin />
      {/* คลาสสำหรับส่วน Body ใต้ Navbar */}
      <div className={styles.adminPageLayout}>
        <SidebarAdmin activeSection={activeSection} setSection={setActiveSection} />
        {/* คลาสสำหรับพื้นที่แสดงเนื้อหาหลัก */}
        <main className={styles.mainContent}>
          <Outlet context={{ activeSection, setActiveSection }} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;