import React from 'react';
import styles from './SidebarAdmin.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox, faUserTie, faUserSecret, faUserShield, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

// ✅ รับ props (activeSection, setSection) จาก AdminLayout เพื่อทำงานร่วมกัน
function SidebarAdmin({ activeSection, setSection, notifications }) {
  
  // ✅ โครงสร้างข้อมูลเมนูที่ชัดเจนและง่ายต่อการแก้ไขเพิ่มเติมในอนาคต
  const menuItems = [
    { id: 'pending-review', icon: faInbox, text: 'เอกสารรอตรวจ' },
    { id: 'pending-advisor', icon: faUserTie, text: 'อาจารย์ที่ปรึกษาอนุมัติ' },
    { id: 'pending-external', icon: faUserSecret, text: 'อาจารย์ภายนอกอนุมัติ' },
    { id: 'pending-executive', icon: faUserShield, text: 'ผู้บริหารอนุมัติ' },
    { id: 'all-documents', icon: faFolderOpen, text: 'เอกสารทั้งหมด' },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* ✅ ใช้ .map() เพื่อสร้างปุ่มเมนูจากข้อมูลใน Array โดยอัตโนมัติ */}
      {menuItems.map(item => (
        <button 
          key={item.id}
          /* ✅ การกำหนด className แบบไดนามิก:
            - activeSection คือเมนูที่ถูกเลือกอยู่ ณ ปัจจุบัน (ค่ามาจาก State ใน AdminLayout)
            - ถ้า activeSection ตรงกับ id ของปุ่มนี้ ให้เพิ่มคลาส .active เพื่อให้ปุ่มมีสไตล์ที่แตกต่าง
          */
          className={`${styles.sidebarBtn} ${activeSection === item.id ? styles.active : ''}`}
          
          // ✅ เมื่อคลิกปุ่ม จะเรียกใช้ฟังก์ชัน setSection ที่ได้รับมาจาก AdminLayout
          // เพื่ออัปเดต State และบอกให้หน้าหลักเปลี่ยนเนื้อหาที่แสดงผล
          onClick={() => setSection(item.id)}
        >

          <FontAwesomeIcon icon={item.icon} /> 
          <span>{item.text}</span>
          {/* ✅ 2. แสดงจุดแดงถ้า notifications[item.id] เป็น true */}
          {notifications[item.id] && <span className={styles.notificationDot}></span>}
        </button>
      ))}
    </aside>
  );
}

export default SidebarAdmin;