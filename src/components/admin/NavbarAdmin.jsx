import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './NavbarAdmin.module.css';
import logo from '../../assets/images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// --- ✅ 1. ตรวจสอบว่า faCaretDown ถูก import เข้ามาในนี้ ---
import { faHome, faUsersCog, faSitemap, faCog, faUserCircle, faCaretDown, faUserEdit, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function NavbarAdmin() {
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [adminData, setAdminData] = useState({ name: 'Admin', email: 'Loading...' });

  useEffect(() => {
    const adminEmail = localStorage.getItem("current_user");
    if (adminEmail) {
        setAdminData({ name: "ผู้ดูแลระบบ", email: adminEmail });
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/admin/home" className={styles.logoLink}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" />
          <span>Graduate Tracking System (Admin)</span>
        </div>
      </Link>
      <ul className={styles.navLinks}>
        <li><NavLink to="/admin/home" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faHome} /> หน้าหลัก</NavLink></li>
        <li><NavLink to="/admin/manage-users" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faUsersCog} /> จัดการผู้ใช้งาน</NavLink></li>
        <li><NavLink to="/admin/structures" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faSitemap} /> จัดการโครงสร้าง</NavLink></li>
        <li><NavLink to="/admin/settings" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faCog} /> ตั้งค่าระบบ</NavLink></li>
      </ul>
      
      <div 
        className={styles.userMenu}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <a href="#" onClick={(e) => e.preventDefault()} className={styles.userProfileLink}>
          <div className={styles.userNameContainer}>
            <span className={styles.userName}>{adminData.name}</span>
            <span className={styles.userEmail}>{adminData.email}</span>
          </div>
          <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
          {/* --- ✅ 2. ตรวจสอบว่ามี Component ไอคอนอยู่ตรงนี้ --- */}
          <FontAwesomeIcon icon={faCaretDown} className={styles.caretIcon} /> 
        </a>
        {isMenuOpen && (
          <ul className={styles.dropdownMenu}>
            <li><Link to="/admin/profile"><FontAwesomeIcon icon={faUserEdit} /> จัดการโปรไฟล์</Link></li>
            <li><a href="#" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ</a></li>
          </ul>
        )}
      </div>
    </nav>
  );
}
export default NavbarAdmin;