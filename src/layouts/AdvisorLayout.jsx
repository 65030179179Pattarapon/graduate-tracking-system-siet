import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarAdvisor from '../components/advisor/NavbarAdvisor';
import styles from './AdvisorLayout.module.css';

function AdvisorLayout() {
  return (
    <div className={styles.layoutContainer}>
      <NavbarAdvisor />
      <main className={styles.mainContent}>
        {/* Outlet จะทำหน้าที่แสดง Component ของแต่ละหน้าย่อย (Home, Signature, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}

export default AdvisorLayout;