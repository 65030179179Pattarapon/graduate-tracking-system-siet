import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ManageUsersPage.module.css'; // สำหรับ Styles ทั่วไป เช่น ปุ่ม
import detailStyles from './ManageAdvisorDetailPage.module.css'; // สำหรับ Layout และ Form
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserPlus, faSave, faTimes, faUserCog, faUser, faSitemap, 
    faTrashAlt, faPlus, faEye, faEyeSlash, faSyncAlt, faArrowLeft,
    faUserGraduate, faUserTie
} from '@fortawesome/free-solid-svg-icons';

// --- Constants for Dropdowns ---
const THAI_PREFIXES = ['นาย', 'นาง', 'นางสาว', 'อ.', 'ผศ.', 'รศ.', 'ศ.', 'ผศ.ดร.', 'รศ.ดร.', 'ศ.ดร.'];
const ENG_PREFIXES = ['Mr.', 'Mrs.', 'Ms.', 'Lecturer', 'Asst. Prof.', 'Assoc. Prof.', 'Prof.', 'Asst. Prof. Dr.', 'Assoc. Prof. Dr.', 'Prof. Dr.'];
const GENDERS = ['ชาย', 'หญิง', 'อื่นๆ'];
const ADVISOR_TYPES = ["อาจารย์ประจำ", "อาจารย์ประจำหลักสูตร", "อาจารย์ผู้รับผิดชอบหลักสูตร", "อาจารย์บัณฑิตพิเศษภายใน", "อาจารย์บัณฑิตพิเศษภายนอก", "ผู้บริหาร"];
const ADVISOR_ROLES = ["สอน", "สอบ", "ที่ปรึกษาวิทยานิพนธ์", "ที่ปรึกษาวิทยานิพนธ์ร่วม", "คณบดี", "ผู้ช่วยคณบดี"];
const ASSISTANT_DEAN_DEPTS = ["วิชาการและวิจัย", "พัฒนานักศึกษา", "บริหาร"];

// --- State เริ่มต้นสำหรับฟอร์มเปล่า ---
const INITIAL_ADVISOR_STATE = {
    advisor_id: '', prefix_th: 'อ.', first_name_th: '', middle_name_th: '', last_name_th: '',
    prefix_en: 'Lecturer', first_name_en: '', middle_name_en: '', last_name_en: '',
    email: '', contact_email: '', phone: '', secondary_phone: '', office_location: '',
    gender: 'ชาย', gender_other: '', type: '', roles: [], assigned_programs: [],
    password: '', confirm_password: '', academic_works: [], profile_img: null
};

function AddAdvisorPage() {
    const navigate = useNavigate();
    const [advisorData, setAdvisorData] = useState(INITIAL_ADVISOR_STATE);
    const [allPrograms, setAllPrograms] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [activeSection, setActiveSection] = useState('account');

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await fetch('/data/structures/programs.json');
                const data = await res.json();
                setAllPrograms(data);
            } catch (error) {
                console.error("Failed to fetch programs", error);
                alert("เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร");
            }
        };
        fetchPrograms();
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setAdvisorData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleArrayChange = useCallback((fieldName, newArray) => {
        setAdvisorData(prev => ({ ...prev, [fieldName]: newArray }));
    }, []);

    const handleRoleChange = useCallback((e) => {
        const { name, checked } = e.target;
        const currentRoles = advisorData.roles || [];
        const updatedRoles = checked ? [...currentRoles, name] : currentRoles.filter(role => role !== name);
        handleArrayChange('roles', updatedRoles);
    }, [advisorData.roles, handleArrayChange]);
    
    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setAdvisorData(prev => ({...prev, password: password, confirm_password: password}));
    };

    const handleSave = () => {
        if (!advisorData.advisor_id || !advisorData.email || !advisorData.password || !advisorData.first_name_th || !advisorData.last_name_th) {
            alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน: รหัสอาจารย์, ชื่อ, นามสกุล, อีเมล และรหัสผ่าน');
            setActiveSection('account');
            return;
        }
        if (advisorData.password !== advisorData.confirm_password) {
            alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
            setActiveSection('account');
            return;
        }

        const allAdvisors = JSON.parse(localStorage.getItem('savedAdvisors') || '[]');
        const isDuplicate = allAdvisors.some(a => a.advisor_id === advisorData.advisor_id);
        if (isDuplicate) {
            alert('มีรหัสอาจารย์นี้ในระบบแล้ว กรุณาใช้รหัสอื่น');
            return;
        }

        const finalData = { ...advisorData };
        delete finalData.confirm_password;
        allAdvisors.push(finalData);
        localStorage.setItem('savedAdvisors', JSON.stringify(allAdvisors));
        
        alert('เพิ่มข้อมูลอาจารย์ใหม่สำเร็จ!');
        navigate('/admin/manage-users');
    };

    // ✅✅✅ แก้ไข Logic ส่วนจัดการหลักสูตรทั้งหมด ✅✅✅
    const handleAddProgram = () => {
        const currentPrograms = advisorData.assigned_programs || [];
        // เพิ่ม ID ที่เป็นค่าว่างเข้าไปใน Array เพื่อสร้างแถวใหม่
        handleArrayChange('assigned_programs', [...currentPrograms, '']);
    };
    const handleRemoveProgram = (index) => {
        const updatedPrograms = (advisorData.assigned_programs || []).filter((_, i) => i !== index);
        handleArrayChange('assigned_programs', updatedPrograms);
    };
    const handleProgramChange = (index, newId) => {
        const updatedPrograms = (advisorData.assigned_programs || []).map((id, i) => i === index ? Number(newId) : id);
        handleArrayChange('assigned_programs', updatedPrograms);
    };

    return (
        <div className={detailStyles.pageLayout}>
            <aside className={detailStyles.sidebar}>
                <div className={detailStyles.studentProfileCard}>
                    <div className={detailStyles.profileImageContainer}>
                        <div className={detailStyles.noImagePlaceholder}><FontAwesomeIcon icon={faUserPlus} size="2x"/></div>
                    </div>
                    <div className={detailStyles.studentName}>เพิ่มอาจารย์ใหม่</div>
                    <div className={detailStyles.studentId}>กรุณากรอกข้อมูลให้ครบถ้วน</div>
                </div>
                <hr className={detailStyles.divider} />
                <button className={`${detailStyles.sidebarBtn} ${activeSection === 'account' ? detailStyles.active : ''}`} onClick={() => setActiveSection('account')}>
                    <FontAwesomeIcon icon={faUserCog} /><span>การจัดการบัญชี</span>
                </button>
                <button className={`${detailStyles.sidebarBtn} ${activeSection === 'info' ? detailStyles.active : ''}`} onClick={() => setActiveSection('info')}>
                    <FontAwesomeIcon icon={faUser} /><span>ข้อมูลทั่วไป</span>
                </button>
                <button className={`${detailStyles.sidebarBtn} ${activeSection === 'roles' ? detailStyles.active : ''}`} onClick={() => setActiveSection('roles')}>
                    <FontAwesomeIcon icon={faSitemap} /><span>บทบาทและหลักสูตร</span>
                </button>
                <hr className={detailStyles.divider} />
                <button className={detailStyles.sidebarBtn} onClick={() => navigate('/admin/manage-users')}>
                    <FontAwesomeIcon icon={faArrowLeft} /><span>กลับหน้ารายชื่อ</span>
                </button>
            </aside>

            <main className={detailStyles.mainContent}>
                <div className={detailStyles.contentHeader}>
                    <h1><FontAwesomeIcon icon={faUserPlus} /> เพิ่มข้อมูลอาจารย์ใหม่</h1>
                    <button className={styles.btnPrimary} onClick={handleSave}>
                        <FontAwesomeIcon icon={faSave} /> สร้างบัญชีอาจารย์
                    </button>
                </div>

                {activeSection === 'account' && (
                    <div className={detailStyles.card}>
                        <h3><FontAwesomeIcon icon={faUserCog} /> การจัดการบัญชี</h3>
                        <div className={detailStyles.cardBody}>
                            <div className={detailStyles.formSection}>
                                <h4>กำหนดข้อมูลบัญชีเริ่มต้น</h4>
                                <div className={detailStyles.formGrid}>
                                    <div className={detailStyles.formGroup} style={{ gridColumn: '1 / -1' }}><label>อีเมล (สำหรับเข้าสู่ระบบ)</label><input type="email" name="email" value={advisorData.email} onChange={handleInputChange} required /></div>
                                    <div className={detailStyles.formGroup}><label>รหัสผ่าน</label><div className={detailStyles.passwordInputWrapper}><input type={showPassword ? 'text' : 'password'} name="password" value={advisorData.password} onChange={handleInputChange} required /><FontAwesomeIcon icon={faSyncAlt} className={detailStyles.passwordIcon} onClick={generatePassword} title="สุ่มรหัสผ่าน" /></div></div>
                                    <div className={detailStyles.formGroup}><label>ยืนยันรหัสผ่าน</label><div className={detailStyles.passwordInputWrapper}><input type={showPassword ? 'text' : 'password'} name="confirm_password" value={advisorData.confirm_password} onChange={handleInputChange} required /><FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className={detailStyles.passwordIcon} onClick={() => setShowPassword(!showPassword)} /></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'info' && (
                    <div className={detailStyles.card}>
                        <h3><FontAwesomeIcon icon={faUser} /> ข้อมูลทั่วไป</h3>
                        <div className={detailStyles.cardBody}>
                            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`} style={{ marginBottom: '25px' }}><div className={detailStyles.formGroup}><label>รหัสอาจารย์</label><input type="text" name="advisor_id" value={advisorData.advisor_id} onChange={handleInputChange} required /></div></div>
                            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`} style={{ marginBottom: '25px' }}><div className={detailStyles.formGroup}><label>คำนำหน้า/ยศ (ไทย)</label><select name="prefix_th" value={advisorData.prefix_th} onChange={handleInputChange}>{THAI_PREFIXES.map(p=><option key={p} value={p}>{p}</option>)}</select></div><div className={detailStyles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" name="first_name_th" value={advisorData.first_name_th} onChange={handleInputChange} /></div><div className={detailStyles.formGroup}><label>ชื่อกลาง (ไทย)</label><input type="text" name="middle_name_th" value={advisorData.middle_name_th} onChange={handleInputChange} /></div><div className={detailStyles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" name="last_name_th" value={advisorData.last_name_th} onChange={handleInputChange} /></div></div>
                            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`} style={{ marginBottom: '25px' }}><div className={detailStyles.formGroup}><label>คำนำหน้า (อังกฤษ)</label><select name="prefix_en" value={advisorData.prefix_en} onChange={handleInputChange}>{ENG_PREFIXES.map(p=><option key={p} value={p}>{p}</option>)}</select></div><div className={detailStyles.formGroup}><label>First Name (อังกฤษ)</label><input type="text" name="first_name_en" value={advisorData.first_name_en} onChange={handleInputChange} /></div><div className={detailStyles.formGroup}><label>Middle Name (อังกฤษ)</label><input type="text" name="middle_name_en" value={advisorData.middle_name_en} onChange={handleInputChange} /></div><div className={detailStyles.formGroup}><label>Last Name (อังกฤษ)</label><input type="text" name="last_name_en" value={advisorData.last_name_en} onChange={handleInputChange} /></div></div>
                            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`} style={{ marginBottom: '25px' }}><div className={detailStyles.formGroup}><label>อีเมลสำหรับติดต่อ</label><input type="email" name="contact_email" value={advisorData.contact_email} onChange={handleInputChange} /></div><div className={detailStyles.formGroup}><label>เบอร์โทรศัพท์หลัก</label><input type="tel" name="phone" value={advisorData.phone} onChange={handleInputChange} /></div><div className={detailStyles.formGroup}><label>เบอร์โทรศัพท์สำรอง</label><input type="text" name="secondary_phone" value={advisorData.secondary_phone} onChange={handleInputChange} /></div><div className={detailStyles.formGroup}><label>ห้อง/สถานที่ทำงาน</label><input type="text" name="office_location" value={advisorData.office_location} onChange={handleInputChange} /></div></div>
                            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`}><div className={detailStyles.formGroup}><label>เพศ</label><select name="gender" value={advisorData.gender} onChange={handleInputChange}>{GENDERS.map(g=><option key={g} value={g}>{g}</option>)}</select>{advisorData.gender === 'อื่นๆ' && (<input type="text" name="gender_other" value={advisorData.gender_other} onChange={handleInputChange} placeholder="โปรดระบุ" style={{marginTop:'10px'}}/>)}</div></div>
                        </div>
                    </div>
                )}

                {activeSection === 'roles' && (
                    <>
                        <div className={detailStyles.card}>
                            <h3><FontAwesomeIcon icon={faUserTie} /> ประเภทของอาจารย์</h3>
                            <div className={detailStyles.cardBody}>
                                <div className={`${detailStyles.formGrid} ${detailStyles.oneCol}`}>
                                    <select name="type" value={advisorData.type} onChange={handleInputChange}>
                                        <option value="">-- กรุณาเลือกประเภท --</option>
                                        {ADVISOR_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={detailStyles.card}>
                            <h3><FontAwesomeIcon icon={faSitemap} /> บทบาทหน้าที่</h3>
                            <div className={detailStyles.cardBody}>
                                <div className={`${detailStyles.formGrid} ${detailStyles.threeCols}`}>
                                    {ADVISOR_ROLES.map(role => (
                                        <div key={role} className={detailStyles.formGroup}>
                                            <label className={detailStyles.checkboxContainer}>
                                                <input type="checkbox" name={role} checked={(advisorData.roles || []).includes(role)} onChange={handleRoleChange}/>
                                                <span className={detailStyles.checkmark}></span> {role}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {(advisorData.roles || []).includes('ผู้ช่วยคณบดี') && (
                                    <div className={`${detailStyles.formGrid} ${detailStyles.oneCol}`} style={{marginTop:'15px'}}>
                                        <div className={detailStyles.formGroup}>
                                            <label>ฝ่ายสำหรับผู้ช่วยคณบดี</label>
                                            <select name="assistant_dean_dept" value={advisorData.assistant_dean_dept} onChange={handleInputChange}>
                                                <option value="">-- เลือกฝ่าย --</option>
                                                {ASSISTANT_DEAN_DEPTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={detailStyles.card}>
                            <h3><FontAwesomeIcon icon={faUserGraduate} /> หลักสูตรที่ได้รับมอบหมาย</h3>
                            <div className={detailStyles.cardBody}>
                                {(advisorData.assigned_programs || []).map((programId, index) => (
                                    <div key={index} className={detailStyles.programItem}>
                                        <select value={programId} onChange={e => handleProgramChange(index, e.target.value)}>
                                            <option value="">-- เลือกหลักสูตร --</option>
                                            {allPrograms.map(p => (
                                                <option key={p.id} value={p.id}>({p.degreeLevel}) {p.name}</option>
                                            ))}
                                        </select>
                                        <button type="button" className={detailStyles.removeBtn} onClick={() => handleRemoveProgram(index)}>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className={detailStyles.addBtn} onClick={handleAddProgram}>
                                    <FontAwesomeIcon icon={faPlus} /> เพิ่มหลักสูตร
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default AddAdvisorPage;