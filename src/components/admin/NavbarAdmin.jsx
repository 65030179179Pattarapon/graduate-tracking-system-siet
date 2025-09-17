import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './NavbarAdmin.module.css';
import logo from '../../assets/images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsersCog, faSitemap, faCog, faUserCircle, faCaretDown, faUserEdit, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


// ✅ 1. สร้าง Component สำหรับ Modal โดยเฉพาะ
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3>ยืนยันการออกจากระบบ</h3>
        <p>คุณต้องการที่จะออกจากระบบใช่หรือไม่?</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            ยกเลิก
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
};


function NavbarAdmin() {
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [adminData, setAdminData] = useState({ name: 'Admin', email: 'Loading...' });

  // ✅ 2. เพิ่ม State สำหรับควบคุมการเปิด/ปิด Modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const adminEmail = localStorage.getItem("current_user");
    if (adminEmail) {
        setAdminData({ name: "ผู้ดูแลระบบ", email: adminEmail });
    }
  }, []);

  // ✅ 3. แก้ไข handleLogout ให้ทำการ "เปิด" Modal แทน
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  // ✅ 4. สร้างฟังก์ชันใหม่สำหรับ "ยืนยัน" การออกจากระบบ
  const confirmLogout = () => {
    localStorage.clear();
    setIsLogoutModalOpen(false); // ปิด Modal
    navigate('/login');
  };

  return (
    // เราใช้ Fragment (<>) ครอบเพื่อให้สามารถ return Modal ได้
    <>
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
            <FontAwesomeIcon icon={faCaretDown} className={styles.caretIcon} /> 
          </a>
          {isMenuOpen && (
            <ul className={styles.dropdownMenu}>
              <li><Link to="/admin/profile"><FontAwesomeIcon icon={faUserEdit} /> จัดการโปรไฟล์</Link></li>
              {/* ✅ 5. เปลี่ยน onClick ให้เรียกฟังก์ชันใหม่ */}
              <li><a href="#" onClick={handleLogoutClick}><FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ</a></li>
            </ul>
          )}
        </div>
      </nav>

      {/* ✅ 6. Render Modal และส่ง props เข้าไป */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}
export default NavbarAdmin;