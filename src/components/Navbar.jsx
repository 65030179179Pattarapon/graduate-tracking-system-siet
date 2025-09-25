import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../assets/images/logo.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faFileAlt, faEdit, faCaretDown, faLanguage, 
  faDownload, faBookOpen, faUserCircle, faUserEdit, faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

function Navbar({ userData, onLogoutClick }) {
  // นำ state สำหรับควบคุม Dropdown กลับมา
  const [formsOpen, setFormsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <Link to="/student/home" className={styles.logoLink}>
        <div className={styles.logo}>
          <img src={logo} alt="KMITL Logo" />
          <span>Graduate Tracking System</span>
        </div>
      </Link>

      <ul className={styles.navLinks}>
        <li><NavLink to="/student/home" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faHome} /> หน้าหลัก</NavLink></li>
        <li><NavLink to="/student/status" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faFileAlt} /> สถานะเอกสาร</NavLink></li>
        
        <li className={styles.dropdown} onMouseEnter={() => setFormsOpen(true)} onMouseLeave={() => setFormsOpen(false)}>
          <a href="#" onClick={(e) => e.preventDefault()}>
            <FontAwesomeIcon icon={faEdit} /> กรอกแบบฟอร์ม <FontAwesomeIcon icon={faCaretDown} />
          </a>
          {formsOpen && (
            <ul className={styles.dropdownMenu}>
              <li className={styles.dropdownHeader}>ขั้นการสอบหัวข้อและเค้าโครง</li>
              <li><Link to="/student/form1">แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม</Link></li>
              <li><Link to="/student/form2">แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์ ระดับบัณฑิตศึกษา</Link></li>
              <li><Link to="/student/form3">แบบนำส่งเอกสารหัวข้อและเค้าโครงวิทยานิพนธ์ 1 เล่ม</Link></li>
              <li><Link to="/student/form4">แบบขอหนังสือเชิญเป็นผู้ทรงคุณวุฒิตรวจและประเมิน...เพื่อการวิจัย</Link></li>
              <li><Link to="/student/form5">แบบขอหนังสือขออนุญาตเก็บรวบรวมข้อมูล (วิทยานิพนธ์)</Link></li>
              <li className={styles.dropdownDivider}></li>
              <li className={styles.dropdownHeader}>ขั้นการสอบวิทยานิพนธ์ขั้นสุดท้าย</li>
              <li><Link to="/student/form6">บันทึกข้อความ เรื่อง ขอแต่งตั้งคณะกรรมการการสอบวิทยานิพนธ์ขั้นสุดท้าย</Link></li>
            </ul>
          )}
        </li>
        
         <li><NavLink to="/student/exam-submit" className={({ isActive }) => isActive ? styles.active : ''}><i className="fas fa-file-import"></i> ยื่นคะแนนสอบ</NavLink></li>
        <li><NavLink to="/student/templates" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faDownload} /> ดาวน์โหลดเอกสาร</NavLink></li>
        <li><NavLink to="/student/guide" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faBookOpen} /> คู่มือการใช้งาน</NavLink></li>
      </ul>

      {/* --- 🎯 นี่คือส่วนที่แก้ไขกลับมาเป็น Dropdown ที่ถูกต้อง --- */}
<div className={styles.userMenu}>
        <a href="#" onClick={(e) => e.preventDefault()} className={styles.userProfileLink}>
          {/* เพิ่ม div ครอบชื่อและอีเมล */}
          <div className={styles.userNameContainer}>
            <span className={styles.userName}>{userData.name}</span>
            <span className={styles.userEmail}>{userData.email}</span>
          </div>
          <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
          <FontAwesomeIcon icon={faCaretDown} />
        </a>
        
        {/* Dropdown Menu จะถูกแสดง/ซ่อน โดย CSS */}
        <ul className={`${styles.dropdownMenu} ${styles.userDropdownMenu}`}>
          <li className={styles.userInfoHeader}>
            <div className={styles.infoDetail}>
              <strong>รหัสนักศึกษา:</strong>
              <span>{userData.studentId}</span>
            </div>
            <div className={styles.infoDetail}>
              <strong>ชื่อ-นามสกุล:</strong>
              <span>{userData.name}</span>
            </div>
            <div className={styles.infoDetail}>
              <strong>อีเมล:</strong>
              <span>{userData.email}</span>
            </div>
          </li>
          <li className={styles.dropdownDivider}></li>
          <li><Link to="/student/profile"><FontAwesomeIcon icon={faUserEdit} /> จัดการโปรไฟล์</Link></li>
          <li><a href="#" onClick={onLogoutClick}><FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ</a></li>
        </ul>
      </div>
       {/* --- จบส่วนที่แก้ไข --- */}
    </nav>
  );
}

export default Navbar;