import React from 'react';
import styles from './SidebarAdmin.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faInbox, faUserTie, faUserSecret, faUserShield, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

// รับ props activeSection และ setSection เพื่อควบคุมการแสดงผลจากหน้าแม่
function SidebarAdmin({ activeSection, setSection }) {
  const menuItems = [
    { id: 'pending-review', icon: faInbox, text: 'เอกสารรอตรวจ' },
    { id: 'pending-advisor', icon: faUserTie, text: 'อาจารย์ที่ปรึกษาอนุมัติ' },
    { id: 'pending-external', icon: faUserSecret, text: 'อาจารย์ภายนอกอนุมัติ' },
    { id: 'pending-executive', icon: faUserShield, text: 'ผู้บริหารอนุมัติ' },
    { id: 'all-documents', icon: faFolderOpen, text: 'เอกสารทั้งหมด' },
  ];

  return (
    <aside className={styles.sidebar}>
      {menuItems.map(item => (
        <button 
          key={item.id}
          className={`${styles.sidebarBtn} ${activeSection === item.id ? styles.active : ''}`}
          onClick={() => setSection(item.id)}
        >
          <FontAwesomeIcon icon={item.icon} /> {item.text}
        </button>
      ))}
    </aside>
  );
}

export default SidebarAdmin;