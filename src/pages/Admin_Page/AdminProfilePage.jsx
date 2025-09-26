import React, { useState, useEffect } from 'react';
import styles from './AdminProfilePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEnvelope, faKey, faSave, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// ✅ 1. สร้าง Component สำหรับช่องใส่รหัสผ่านที่มีไอคอนลูกตาโดยเฉพาะ
const PasswordInput = ({ name, value, onChange, placeholder = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className={styles.passwordWrapper}>
            <input 
                type={isVisible ? 'text' : 'password'} 
                id={name}
                name={name} 
                value={value} 
                onChange={onChange} 
                required 
                placeholder={placeholder}
            />
            <button 
                type="button" 
                className={styles.eyeIcon} 
                onClick={() => setIsVisible(!isVisible)}
            >
                <FontAwesomeIcon icon={isVisible ? faEyeSlash : faEye} />
            </button>
        </div>
    );
};


function AdminProfilePage() {
    // State สำหรับเก็บข้อมูลที่แสดงผล
    const [adminInfo, setAdminInfo] = useState({ name: '', email: '' });
    
    // State สำหรับฟอร์มเปลี่ยนรหัสผ่าน
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // State สำหรับแสดงข้อความตอบกลับ (Success/Error)
    const [message, setMessage] = useState({ type: '', text: '' });

    // โหลดข้อมูลแอดมินจาก localStorage เมื่อเปิดหน้า
    useEffect(() => {
        const name = localStorage.getItem("current_user_name");
        const email = localStorage.getItem("current_user");
        if (name && email) {
            setAdminInfo({ name, email });
        }
    }, []);

    // ฟังก์ชันจัดการการเปลี่ยนแปลงในฟอร์มรหัสผ่าน
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // ฟังก์ชันยืนยันการเปลี่ยนรหัสผ่าน
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' });
            return;
        }
        if (!passwordData.newPassword) {
            setMessage({ type: 'error', text: 'กรุณากรอกรหัสผ่านใหม่' });
            return;
        }

        try {
            const response = await fetch('/data/admin.json');
            const admins = await response.json();
            const currentAdmin = admins.find(admin => admin.email === adminInfo.email);

            if (!currentAdmin) {
                setMessage({ type: 'error', text: 'ไม่พบข้อมูลผู้ใช้นี้ในระบบ' });
                return;
            }

            if (currentAdmin.password !== passwordData.currentPassword) {
                setMessage({ type: 'error', text: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
                return;
            }
            
            console.log("Password changed successfully for:", adminInfo.email);
            setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ' });
            console.error("Error fetching admin data:", error);
        }
    };

 
    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1>โปรไฟล์ผู้ดูแลระบบ</h1>
                <p>จัดการข้อมูลส่วนตัวและเปลี่ยนรหัสผ่านของคุณ</p>
            </header>

            <div className={styles.profileLayout}>
                {/* --- ส่วนแสดงข้อมูลโปรไฟล์ (ซ้าย) --- */}
                <div className={styles.profileCard}>
                    <FontAwesomeIcon icon={faUserCircle} className={styles.profileIcon} />
                    <h2>{adminInfo.name}</h2>
                    <p>{adminInfo.email}</p>
                    <span className={styles.roleBadge}>ผู้ดูแลระบบ</span>
                </div>

                {/* --- ส่วนตั้งค่า (ขวา) --- */}
                <div className={styles.settingsCard}>
                    <form onSubmit={handlePasswordSubmit}>
                        <fieldset className={styles.settingFieldset}>
                            {/* ✅✅✅ แก้ไขโดยการเพิ่ม div ครอบ legend ✅✅✅ */}
                            <div className={styles.legendWrapper}>
                                <legend>เปลี่ยนรหัสผ่าน</legend>
                            </div>

                            {message.text && (
                                <div className={`${styles.messageBox} ${message.type === 'success' ? styles.success : styles.error}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</label>
                                <PasswordInput 
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="newPassword">รหัสผ่านใหม่</label>
                                <PasswordInput 
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
                                <PasswordInput 
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                        </fieldset>
                        <div className={styles.actions}>
                            <button type="submit" className={styles.saveButton}>
                                <FontAwesomeIcon icon={faSave} /> บันทึกการเปลี่ยนแปลง
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminProfilePage;