import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './NavbarAdvisor.module.css';
import logo from '../../assets/images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFileAlt, faUsers, faUserCircle, faCaretDown, faUserEdit, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// --- Logout Confirmation Modal ---
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h3>ยืนยันการออกจากระบบ</h3>
                <p>คุณต้องการที่จะออกจากระบบใช่หรือไม่?</p>
                <div className={styles.modalActions}>
                    <button className={styles.cancelButton} onClick={onClose}>ยกเลิก</button>
                    <button className={styles.confirmButton} onClick={onConfirm}>ออกจากระบบ</button>
                </div>
            </div>
        </div>
    );
};

function NavbarAdvisor() {
    const navigate = useNavigate();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [advisorData, setAdvisorData] = useState({ name: 'Advisor', email: 'Loading...' });
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        const advisorName = localStorage.getItem("current_user_name");
        const advisorEmail = localStorage.getItem("current_user");
        if (advisorName && advisorEmail) {
            setAdvisorData({ name: advisorName, email: advisorEmail });
        }
    }, []);

    const handleLogoutClick = (e) => {
        e.preventDefault();
        setMenuOpen(false);
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        localStorage.clear();
        setIsLogoutModalOpen(false);
        navigate('/login');
    };

    return (
        <>
            <nav className={styles.navbar}>
                <Link to="/advisor/home" className={styles.logoLink}>
                    <div className={styles.logo}>
                        <img src={logo} alt="Logo" />
                        <span>Graduate Tracking System</span>
                    </div>
                </Link>
                <ul className={styles.navLinks}>
                    <li><NavLink to="/advisor/home" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faHome} /> หน้าหลัก</NavLink></li>
                    <li><NavLink to="/advisor/documents" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faFileAlt} /> เอกสาร</NavLink></li>
                    <li><NavLink to="/advisor/advisees" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faUsers} /> นักศึกษาในที่ปรึกษา</NavLink></li>
                </ul>
                
                <div 
                    className={styles.userMenu}
                    onMouseEnter={() => setMenuOpen(true)}
                    onMouseLeave={() => setMenuOpen(false)}
                >
                    <a href="#" onClick={(e) => e.preventDefault()} className={styles.userProfileLink}>
                        <div className={styles.userNameContainer}>
                            <span className={styles.userName}>{advisorData.name}</span>
                            <span className={styles.userEmail}>{advisorData.email}</span>
                        </div>
                        <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
                        <FontAwesomeIcon icon={faCaretDown} className={styles.caretIcon} /> 
                    </a>
                    {isMenuOpen && (
                        <ul className={styles.dropdownMenu}>
                            <li><Link to="/advisor/profile"><FontAwesomeIcon icon={faUserEdit} /> จัดการโปรไฟล์</Link></li>
                            <li><a href="#" onClick={handleLogoutClick}><FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ</a></li>
                        </ul>
                    )}
                </div>
            </nav>

            <LogoutModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
            />
        </>
    );
}
export default NavbarAdvisor;