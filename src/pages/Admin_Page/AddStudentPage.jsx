// src/pages/Admin_Page/AddStudentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ManageStudentDetailPage.module.css'; // เราจะใช้สไตล์ร่วมกัน
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCog, faUser, faBook, faUsers, faFileAlt, faHistory, 
    faArrowLeft, faSave, faUserPlus, faEye, faEyeSlash, faSyncAlt,
    faUserGraduate // 👈 เพิ่มไอคอนที่ขาดหายไปที่นี่
} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

// State เริ่มต้นสำหรับฟอร์มเปล่า
const INITIAL_NEW_STUDENT = {
    student_id: '',
    prefix_th: '',
    first_name_th: '',
    last_name_th: '',
    middle_name_th: '',
    prefix_en: 'Mr.',
    first_name_en: '',
    last_name_en: '',
    middle_name_en: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    gender: 'ชาย',
    degree: 'ปริญญาโท',
    program: '',
    major: '',
    student_status: 'กำลังศึกษา',
    entry_year: '',
    entry_semester: '1',
    entry_type: 'ปกติ',
    study_plan: '',
    profile_img: null,
    publications: [],
    related_files: [],
};

// --- Main Page Component ---
function AddStudentPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_NEW_STUDENT);
    const [advisors, setAdvisors] = useState([]);
    const [activeSection, setActiveSection] = useState('account');
    const [showPassword, setShowPassword] = useState(false);

    // Fetch ข้อมูลที่จำเป็นสำหรับ Dropdown
    useEffect(() => {
        const fetchRequiredData = async () => {
            try {
                const advisorsRes = await fetch('/data/advisor.json');
                const advisorsData = await advisorsRes.json();
                setAdvisors(advisorsData);
            } catch (error) {
                console.error("Failed to fetch advisors", error);
                alert("ไม่สามารถโหลดข้อมูลอาจารย์ได้");
            }
        };
        fetchRequiredData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({...prev, password: password, confirm_password: password}));
    };

    const handleSave = () => {
        // --- Validation ---
        if (!formData.student_id || !formData.email || !formData.password) {
            alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน: รหัสนักศึกษา, อีเมล และรหัสผ่าน");
            setActiveSection('account');
            return;
        }
        if (formData.password !== formData.confirm_password) {
            alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            setActiveSection('account');
            return;
        }

        // --- Logic การบันทึก ---
        let allStudents = JSON.parse(localStorage.getItem('savedStudents') || '[]');
        const existingStudent = allStudents.find(s => s.student_id === formData.student_id);

        if (existingStudent) {
            alert("มีรหัสนักศึกษานี้ในระบบแล้ว กรุณาใช้รหัสอื่น");
            return;
        }

        const finalStudentData = { ...formData };
        delete finalStudentData.confirm_password; // ไม่ต้องเก็บ confirm_password

        allStudents.push(finalStudentData);
        localStorage.setItem('savedStudents', JSON.stringify(allStudents));
        
        alert(`เพิ่มนักศึกษาใหม่ (${formData.first_name_th}) สำเร็จ!`);
        navigate('/admin/manage-users'); // กลับไปหน้าจัดการผู้ใช้
    };

    // --- Data สำหรับ Dropdown ---
    const academicData = {
        programsByDegree: {
            'ปริญญาโท': ["วท.ม. การศึกษาวิทยาศาสตร์และเทคโนโลยี", "วท.ม. คอมพิวเตอร์ศึกษา", "ค.อ.ม. นวัตกรรมและการวิจัยเพื่อการเรียนรู้", "วท.ม. การศึกษาเกษตร", "ค.อ.ม. การบริหารการศึกษา", "ค.อ.ม. วิศวกรรมไฟฟ้าสื่อสาร", "ค.อ.ม. เทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม"],
            'ปริญญาเอก': ["ค.อ.ด. นวัตกรรมและการวิจัยเพื่อการเรียนรู้", "ค.อ.ด. การบริหารการศึกษา", "ปร.ด. สาขาวิชาเทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม", "ปร.ด. คอมพิวเตอร์ศึกษา", "ปร.ด. การศึกษาเกษตร", "ปร.ด. วิศวกรรมไฟฟ้าศึกษา"]
        },
        majors: [ 'การศึกษาวิทยาศาสตร์และเทคโนโลยี', 'คอมพิวเตอร์ศึกษา', 'นวัตกรรมและการวิจัยเพื่อการเรียนรู้', 'การศึกษาเกษตร', 'การบริหารการศึกษา', 'วิศวกรรมไฟฟ้าสื่อสาร', 'เทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม' ],
        entryTypes: ['ปกติ', 'พิเศษ', 'สมทบ'],
        studyPlans: ['แผน ก แบบ ก2', 'แบบ 1.1', 'แบบ 2.1']
    };
    const generateYearOptions = () => {
        const currentBuddhistYear = new Date().getFullYear() + 543;
        const years = [];
        for (let i = 0; i < 20; i++) { years.push(currentBuddhistYear - i); }
        return years;
    };
    const yearOptions = generateYearOptions();

    // --- JSX Return ---
    return (
        <div className={styles.pageLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.studentProfileCard}>
                    <div className={styles.profileImageContainer}>
                        <div className={styles.noImagePlaceholder}><FontAwesomeIcon icon={faUserPlus} size="2x"/></div>
                    </div>
                    <div className={styles.studentName}>เพิ่มนักศึกษาใหม่</div>
                    <div className={styles.studentId}>กรุณากรอกข้อมูลให้ครบถ้วน</div>
                </div>
                <hr className={styles.divider} />
                <button className={`${styles.sidebarBtn} ${activeSection === 'account' ? styles.active : ''}`} onClick={() => setActiveSection('account')}>
                    <FontAwesomeIcon icon={faUserCog} /><span>การจัดการบัญชี</span>
                </button>
                <button className={`${styles.sidebarBtn} ${activeSection === 'info' ? styles.active : ''}`} onClick={() => setActiveSection('info')}>
                    <FontAwesomeIcon icon={faUser} /><span>ข้อมูลทั่วไป/การศึกษา</span>
                </button>
                <hr className={styles.divider} />
                <button className={styles.sidebarBtn} onClick={() => navigate('/admin/manage-users')}>
                    <FontAwesomeIcon icon={faArrowLeft} /><span>กลับหน้ารายชื่อ</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h1><FontAwesomeIcon icon={faUserGraduate} /> เพิ่มข้อมูลนักศึกษาใหม่</h1>
                    <button className={styles.saveButton} onClick={handleSave}>
                        <FontAwesomeIcon icon={faSave} /> สร้างบัญชีนักศึกษา
                    </button>
                </div>

                {/* Account Section */}
                {activeSection === 'account' && (
                    <div className={styles.card}>
                        <h3><FontAwesomeIcon icon={faUserCog} /> การจัดการบัญชี</h3>
                        <div className={styles.cardBody}>
                            <div className={styles.formSection}>
                                <h4>กำหนดข้อมูลบัญชีเริ่มต้น</h4>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                        <label>อีเมล (สำหรับเข้าสู่ระบบ)</label>
                                        <input type="email" name="email" placeholder="กรอกอีเมลสำหรับใช้เข้าสู่ระบบ" value={formData.email} onChange={handleInputChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>รหัสผ่าน</label>
                                        <div className={styles.passwordInputWrapper}>
                                            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="กรอกรหัสผ่าน" value={formData.password} onChange={handleInputChange} required />
                                            <FontAwesomeIcon icon={faSyncAlt} className={styles.passwordIcon} onClick={generatePassword} title="สุ่มรหัสผ่านใหม่" />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>ยืนยันรหัสผ่าน</label>
                                        <div className={styles.passwordInputWrapper}>
                                            <input type={showPassword ? 'text' : 'password'} name="confirm_password" value={formData.confirm_password} onChange={handleInputChange} placeholder="กรอกรหัสผ่านอีกครั้ง" required />
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className={styles.passwordIcon} style={{ right: '40px' }} onClick={() => setShowPassword(!showPassword)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                {activeSection === 'info' && (
                    <>
                        <div className={styles.card}>
                            <h3>ข้อมูลทั่วไป</h3>
                            <div className={styles.cardBody}>
                                <div className={`${styles.formGrid} ${styles.fourCols}`}>
                                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}><label>รหัสนักศึกษา</label><input type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} required /></div>
                                    <div className={styles.formGroup}><label>คำนำหน้า (ไทย)</label><input type="text" name="prefix_th" value={formData.prefix_th} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" name="first_name_th" value={formData.first_name_th} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>ชื่อกลาง (ไทย)</label><input type="text" name="middle_name_th" placeholder="(ถ้ามี)" value={formData.middle_name_th} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" name="last_name_th" value={formData.last_name_th} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>คำนำหน้า (อังกฤษ)</label><select name="prefix_en" value={formData.prefix_en} onChange={handleInputChange}><option value="Mr.">Mr.</option><option value="Mrs.">Mrs.</option><option value="Ms.">Ms.</option></select></div>
                                    <div className={styles.formGroup}><label>First Name (อังกฤษ)</label><input type="text" name="first_name_en" value={formData.first_name_en} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>Middle Name (อังกฤษ)</label><input type="text" name="middle_name_en" placeholder="(Optional)" value={formData.middle_name_en} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>Last Name (อังกฤษ)</label><input type="text" name="last_name_en" value={formData.last_name_en} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>เบอร์โทรศัพท์</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>เพศ</label><select name="gender" value={formData.gender} onChange={handleInputChange}><option value="ชาย">ชาย</option><option value="หญิง">หญิง</option><option value="อื่นๆ">อื่นๆ</option></select></div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <h3>ข้อมูลการศึกษา</h3>
                            <div className={styles.cardBody}>
                                <div className={`${styles.formGrid} ${styles.fourCols}`}>
                                    <div className={styles.formGroup}><label>ระดับการศึกษา</label><select name="degree" value={formData.degree} onChange={handleInputChange}><option value="ปริญญาโท">ปริญญาโท</option><option value="ปริญญาเอก">ปริญญาเอก</option></select></div>
                                    <div className={styles.formGroup}><label>หลักสูตร</label><select name="program" value={formData.program} onChange={handleInputChange}><option value="">-- เลือกหลักสูตร --</option>{academicData.programsByDegree[formData.degree]?.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                    <div className={styles.formGroup}><label>สาขาวิชา</label><select name="major" value={formData.major} onChange={handleInputChange}><option value="">-- เลือกสาขาวิชา --</option>{academicData.majors.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                                    <div className={styles.formGroup}><label>สถานะนักศึกษา</label><select name="student_status" value={formData.student_status} onChange={handleInputChange}><option value="กำลังศึกษา">กำลังศึกษา</option><option value="พ้นสภาพ">พ้นสภาพ</option><option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option></select></div>
                                    <div className={styles.formGroup}><label>ปีการศึกษาที่รับเข้า</label><select name="entry_year" value={formData.entry_year} onChange={handleInputChange}><option value="">-- เลือกปี --</option>{yearOptions.map(year => <option key={year} value={year}>{year}</option>)}</select></div>
                                    <div className={styles.formGroup}><label>ภาคการศึกษาที่รับเข้า</label><select name="entry_semester" value={formData.entry_semester} onChange={handleInputChange}><option value="1">1</option><option value="2">2</option><option value="ภาคพิเศษ">ภาคพิเศษ</option></select></div>
                                    <div className={styles.formGroup}><label>ประเภทที่รับเข้า</label><select name="entry_type" value={formData.entry_type} onChange={handleInputChange}><option value="">-- เลือกประเภท --</option>{academicData.entryTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                    <div className={styles.formGroup}><label>แผนการเรียน</label><select name="study_plan" value={formData.study_plan} onChange={handleInputChange}><option value="">-- เลือกแผน --</option>{academicData.studyPlans.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}

export default AddStudentPage;