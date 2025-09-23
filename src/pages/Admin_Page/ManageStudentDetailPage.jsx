import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './ManageStudentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCog, faUser, faBook, faUsers, faFileAlt, 
    faHistory, faArrowLeft, faSave,
    faUserGraduate, faEye, faEyeSlash, faSyncAlt,
    faUserTie, faClipboardCheck, faCheck, faTimes,
    faPlus, faPencilAlt, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

// ✅ 1. สร้าง State เริ่มต้นสำหรับนักศึกษาใหม่
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


// --- 1. Sidebar Component ---
// ✅ 2. ปรับปรุง Sidebar ให้รองรับโหมดเพิ่มนักศึกษาใหม่
const SidebarManageStudent = ({ student, activeSection, setActiveSection, onBack, isNew }) => {
    if (!student) return <aside className={styles.sidebar}>Loading...</aside>; 
    const navigate = useNavigate();
    
    // ✅ กำหนดเมนูตามโหมด (ถ้าเป็นนักศึกษาใหม่ จะมีแค่ 2 เมนูหลัก)
    const menuItems = isNew ? [
        { id: 'account', icon: faUserCog, text: 'การจัดการบัญชี' },
        { id: 'info', icon: faUser, text: 'ข้อมูลทั่วไป/การศึกษา' },
    ] : [
        { id: 'account', icon: faUserCog, text: 'การจัดการบัญชี' },
        { id: 'info', icon: faUser, text: 'ข้อมูลทั่วไป/การศึกษา' },
        { id: 'thesis', icon: faBook, text: 'ข้อมูลวิทยานิพนธ์' },
        { id: 'committee', icon: faUsers, text: 'คณะกรรมการสอบวิทยานิพนธ์' },
        { id: 'publications', icon: faFileAlt, text: 'ผลงานตีพิมพ์และเอกสาร' },
        { id: 'history', icon: faHistory, text: 'ประวัติการยื่นเอกสาร' },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.studentProfileCard}>
                <div className={styles.profileImageContainer}>
                    {student.profile_img ? (
                        <img src={student.profile_img} alt="Student Profile" className={styles.profileImage} />
                    ) : (
                        <div className={styles.noImagePlaceholder}>{isNew ? <FontAwesomeIcon icon={faUserPlus} size="2x"/> : 'ไม่มีภาพ'}</div>
                    )}
                </div>
                <div className={styles.studentName}>
                    {isNew ? "เพิ่มนักศึกษาใหม่" : `${student.prefix_th || ''}${student.first_name_th || ''} ${student.last_name_th || ''}`}
                </div>
                <div className={styles.studentId}>
                    {isNew ? "กรุณากรอกข้อมูลให้ครบถ้วน" : `รหัสนักศึกษา: ${student.student_id}`}
                </div>
                <div className={styles.studentEmail}>{isNew ? "" : student.email}</div>
            </div>
            <hr className={styles.divider} />
            {menuItems.map(item => (
                <button
                    key={item.id}
                    className={`${styles.sidebarBtn} ${activeSection === item.id ? styles.active : ''}`}
                    onClick={() => setActiveSection(item.id)}
                >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.text}</span>
                </button>
            ))}
            <hr className={styles.divider} />
            <button className={styles.sidebarBtn} onClick={onBack}>
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>กลับหน้ารายชื่อ</span>
            </button>
        </aside>
    );
};

// --- 2. Section Components ---

const AccountSection = ({ student, handleInputChange, isNew }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // ✅ เมื่อสุ่มรหัสผ่าน ให้อัปเดตทั้ง 2 ช่อง (password และ confirm_password)
    handleInputChange({ target: { name: 'password', value: password } });
    handleInputChange({ target: { name: 'confirm_password', value: password } });
  };

  return (
    <div className={styles.card}>
      <h3><FontAwesomeIcon icon={faUserCog} /> การจัดการบัญชี</h3>
      <div className={styles.cardBody}>
        {/* ✅ แสดงส่วนข้อมูลปัจจุบันต่อเมื่อเป็นโหมดแก้ไขเท่านั้น */}
        {!isNew && (
            <div className={styles.formSection}>
                <h4>ข้อมูลปัจจุบัน</h4>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>อีเมล (สำหรับเข้าสู่ระบบ)</label>
                        <input type="email" value={student.email || ''} disabled />
                    </div>
                    <div className={styles.formGroup}>
                        <label>รหัสผ่านปัจจุบัน</label>
                         <input 
                            type="password"
                            value="••••••••" 
                            readOnly
                            className={styles.readOnlyInput}
                        />
                    </div>
                </div>
            </div>
        )}
        
        <div className={styles.formSection}>
          <h4>{isNew ? 'กำหนดข้อมูลบัญชีเริ่มต้น' : 'แก้ไขข้อมูลบัญชี'}</h4>
          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label>อีเมล (สำหรับเข้าสู่ระบบ)</label>
              <input 
                type="email" 
                name="email"
                placeholder={isNew ? "กรอกอีเมลสำหรับใช้เข้าสู่ระบบ" : "กรอกอีเมลใหม่ (ถ้าต้องการเปลี่ยน)"} 
                value={student.email || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>{isNew ? 'รหัสผ่าน' : 'รหัสผ่านใหม่'}</label>
              <div className={styles.passwordInputWrapper}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password" 
                  placeholder={isNew ? "กรอกรหัสผ่าน" : "เว้นว่างไว้หากไม่ต้องการเปลี่ยน"}
                  value={student.password || ''}
                  onChange={handleInputChange}
                  required={isNew} // ✅ บังคับกรอกเฉพาะตอนสร้างใหม่
                />
                <FontAwesomeIcon 
                  icon={faSyncAlt} 
                  className={styles.passwordIcon}
                  onClick={generatePassword}
                  title="สุ่มรหัสผ่านใหม่"
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>{isNew ? 'ยืนยันรหัสผ่าน' : 'ยืนยันรหัสผ่านใหม่'}</label>
              <div className={styles.passwordInputWrapper}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="confirm_password" 
                  value={student.confirm_password || ''} 
                  onChange={handleInputChange}
                  placeholder={isNew ? "กรอกรหัสผ่านอีกครั้ง" : "ยืนยันรหัสผ่านใหม่"}
                  required={isNew} // ✅ บังคับกรอกเฉพาะตอนสร้างใหม่
                />
                <FontAwesomeIcon 
                  icon={showPassword ? faEyeSlash : faEye} 
                  className={styles.passwordIcon}
                  style={{ right: '40px' }} // Adjust icon position
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoSection = ({ student, handleInputChange, isNew }) => {
    // ... โค้ดส่วนนี้เหมือนเดิมเป๊ะ ไม่มีการเปลี่ยนแปลง ...
    const academicData = {
        programsByDegree: {
            'ปริญญาโท': ["วท.ม. การศึกษาวิทยาศาสตร์และเทคโนโลยี", "วท.ม. คอมพิวเตอร์ศึกษา", "ค.อ.ม. นวัตกรรมและการวิจัยเพื่อการเรียนรู้", "วท.ม. การศึกษาเกษตร", "ค.อ.ม. การบริหารการศึกษา", "ค.อ.ม. วิศวกรรมไฟฟ้าสื่อสาร", "ค.อ.ม. เทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม"],
            'ปริญญาเอก': ["ค.อ.ด. นวัตกรรมและการวิจัยเพื่อการเรียนรู้", "ค.อ.ด. การบริหารการศึกษา", "ปร.ด. สาขาวิชาเทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม", "ปร.ด. คอมพิวเตอร์ศึกษา", "ปร.ด. การศึกษาเกษตร", "ปร.ด. วิศวกรรมไฟฟ้าศึกษา"]
        },
        majors: [ 'การศึกษาวิทยาศาสตร์และเทคโนโลยี', 'คอมพิวเตอร์ศึกษา', 'นวัตกรรมและการวิจัยเพื่อการเรียนรู้', 'การศึกษาเกษตร', 'การบริหารการศึกษา', 'วิศวกรรมไฟฟ้าสื่อสาร', 'เทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม' ],
        entryTypes: ['ปกติ', 'พิเศษ', 'สมทบ'],
        studyPlans: ['แผน ก แบบ ก2', 'แบบ 1.1', 'แบบ 2.1']
    };
    
    const [selectedDegree, setSelectedDegree] = useState(student.degree || 'ปริญญาโท');

    const handleDegreeChange = (e) => {
        setSelectedDegree(e.target.value);
        handleInputChange(e); 
    };

    const generateYearOptions = () => {
        const currentBuddhistYear = new Date().getFullYear() + 543;
        const years = [];
        for (let i = 0; i < 20; i++) {
            years.push(currentBuddhistYear - i);
        }
        return years;
    };
    const yearOptions = generateYearOptions();

    return (
        <>
            <div className={styles.card}>
                <h3>ข้อมูลทั่วไป</h3>
                <div className={styles.cardBody}>
                    <div className={`${styles.formGrid} ${styles.fourCols}`}>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label>รหัสนักศึกษา</label>
                            {/* ✅ ทำให้ช่องรหัสนักศึกษาแก้ไขได้เฉพาะตอนสร้างใหม่ */}
                            <input type="text" name="student_id" value={student.student_id || ''} disabled={!isNew} onChange={handleInputChange} required />
                        </div>
                        <div className={styles.formGroup}><label>คำนำหน้า (ไทย)</label><input type="text" name="prefix_th" value={student.prefix_th || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" name="first_name_th" value={student.first_name_th || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>ชื่อกลาง (ไทย)</label><input type="text" name="middle_name_th" placeholder="(ถ้ามี)" value={student.middle_name_th || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" name="last_name_th" value={student.last_name_th || ''} onChange={handleInputChange} /></div>
                        
                        <div className={styles.formGroup}>
                            <label>คำนำหน้า (อังกฤษ)</label>
                            <select name="prefix_en" value={student.prefix_en || ''} onChange={handleInputChange}>
                                <option value="Mr.">Mr.</option>
                                <option value="Mrs.">Mrs.</option>
                                <option value="Ms.">Ms.</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}><label>First Name (อังกฤษ)</label><input type="text" name="first_name_en" value={student.first_name_en || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>Middle Name (อังกฤษ)</label><input type="text" name="middle_name_en" placeholder="(Optional)" value={student.middle_name_en || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>Last Name (อังกฤษ)</label><input type="text" name="last_name_en" value={student.last_name_en || ''} onChange={handleInputChange} /></div>
                        
                        <div className={styles.formGroup}><label>เบอร์โทรศัพท์</label><input type="tel" name="phone" value={student.phone || ''} onChange={handleInputChange} /></div>
                        
                        <div className={styles.formGroup}>
                            <label>เพศ</label>
                            <select name="gender" value={(student.gender === 'ชาย' || student.gender === 'หญิง') ? student.gender : 'อื่นๆ'} onChange={handleInputChange}>
                                <option value="ชาย">ชาย</option>
                                <option value="หญิง">หญิง</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>
                        
                        {(student.gender !== 'ชาย' && student.gender !== 'หญิง') && (
                             <div className={styles.formGroup}>
                                <label>ระบุเพศ</label>
                                <input 
                                    type="text"
                                    name="gender"
                                    placeholder="กรุณาระบุเพศ" 
                                    value={student.gender || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.card}>
                <h3>ข้อมูลการศึกษา</h3>
                <div className={styles.cardBody}>
                    <div className={`${styles.formGrid} ${styles.fourCols}`}>
                        <div className={styles.formGroup}>
                            <label>ระดับการศึกษา</label>
                            <select name="degree" value={selectedDegree} onChange={handleDegreeChange}>
                                <option value="ปริญญาโท">ปริญญาโท</option>
                                <option value="ปริญญาเอก">ปริญญาเอก</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>หลักสูตร</label>
                            <select name="program" value={student.program || ''} onChange={handleInputChange}>
                                <option value="">-- เลือกหลักสูตร --</option>
                                {academicData.programsByDegree[selectedDegree]?.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>สาขาวิชา</label>
                            <select name="major" value={student.major || ''} onChange={handleInputChange}>
                                 <option value="">-- เลือกสาขาวิชา --</option>
                                {academicData.majors.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>สถานะนักศึกษา</label>
                            <select name="student_status" value={student.student_status || ''} onChange={handleInputChange}>
                                <option value="กำลังศึกษา">กำลังศึกษา</option>
                                <option value="พ้นสภาพ">พ้นสภาพ</option>
                                <option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ปีการศึกษาที่รับเข้า</label>
                            <select name="entry_year" value={student.entry_year || ''} onChange={handleInputChange}>
                                <option value="">-- เลือกปี --</option>
                                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ภาคการศึกษาที่รับเข้า</label>
                            <select name="entry_semester" value={student.entry_semester || ''} onChange={handleInputChange}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="ภาคพิเศษ">ภาคพิเศษ</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ประเภทที่รับเข้า</label>
                            <select name="entry_type" value={student.entry_type || ''} onChange={handleInputChange}>
                                 <option value="">-- เลือกประเภท --</option>
                                {academicData.entryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>แผนการเรียน</label>
                            <select name="study_plan" value={student.study_plan || ''} onChange={handleInputChange}>
                                 <option value="">-- เลือกแผน --</option>
                                {academicData.studyPlans.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


// ... ที่เหลือคือ Components เดิมของคุณ (ThesisSection, CommitteeSection, etc.) ...
// ... ผมจะใส่โค้ดส่วนนี้กลับมาให้เหมือนเดิมเป๊ะๆ ตามที่คุณต้องการ ...
const ThesisSection = ({ student, advisors, documents, handleInputChange }) => {
    const mainAdvisor = advisors.find(a => a.advisor_id === student.main_advisor_id);
    const coAdvisor1 = advisors.find(a => a.advisor_id === student.co_advisor1_id);
    const approvedForm2 = documents.find(d => d.type === 'ฟอร์ม 2' && d.status === 'อนุมัติแล้ว');
    const coAdvisor2 = approvedForm2 ? advisors.find(a => a.advisor_id === approvedForm2.committee?.co_advisor2_id) : null;
    const qeExamDoc = documents.find(d => d.type === 'ผลสอบวัดคุณสมบัติ' && d.status === 'อนุมัติแล้ว');
    const engExamDoc = documents.find(d => d.type === 'ผลสอบภาษาอังกฤษ' && d.status === 'อนุมัติแล้ว');

    const getAdvisorName = (advisor) => {
        return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : '— ยังไม่มีข้อมูล —';
    };

    const passOptions = (
        <>
            <option value="">-- ยังไม่มีข้อมูล --</option>
            <option value="ผ่าน">ผ่าน</option>
            <option value="ไม่ผ่าน">ไม่ผ่าน</option>
        </>
    );

    return (
        <>
            <div className={styles.card}>
                <h3><FontAwesomeIcon icon={faUserTie} /> ข้อมูลอาจารย์ที่ปรึกษาวิทยานิพนธ์</h3>
                <div className={styles.cardBody}>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}>
                            <label>ที่ปรึกษาหลัก</label>
                            <input type="text" value={getAdvisorName(mainAdvisor)} disabled className={styles.readOnlyInput} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>ที่ปรึกษาร่วม 1</label>
                            <input type="text" value={getAdvisorName(coAdvisor1)} disabled className={styles.readOnlyInput} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>ที่ปรึกษาร่วม 2 (จากฟอร์ม 2)</label>
                            <input type="text" value={getAdvisorName(coAdvisor2)} disabled className={styles.readOnlyInput} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3><FontAwesomeIcon icon={faBook} /> รายละเอียดหัวข้อเสนอเค้าโครงวิทยานิพนธ์</h3>
                <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                            <label>ชื่อหัวข้อ (ไทย)</label>
                            <textarea name="thesis_title_th" rows="3" value={student.thesis_title_th || ''} onChange={handleInputChange}></textarea>
                        </div>
                        <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                            <label>ชื่อหัวข้อ (อังกฤษ)</label>
                            <textarea name="thesis_title_en" rows="3" value={student.thesis_title_en || ''} onChange={handleInputChange}></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>วันที่ประกาศหัวข้อ</label>
                            <input name="proposal_approval_date" type="date" value={student.proposal_approval_date?.split('T')[0] || ''} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>วันที่สอบหัวข้อ</label>
                            <input name="proposal_exam_date" type="date" value={student.proposal_exam_date?.split('T')[0] || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3><FontAwesomeIcon icon={faBook} /> รายละเอียดสอบจบวิทยานิพนธ์</h3>
                 <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                            <label>ชื่อหัวข้อ (ไทย)</label>
                            <textarea name="final_thesis_title_th" rows="3" value={student.final_thesis_title_th || student.thesis_title_th || ''} onChange={handleInputChange} placeholder="— ยังไม่มีข้อมูล —"></textarea>
                        </div>
                        <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                            <label>ชื่อหัวข้อ (อังกฤษ)</label>
                            <textarea name="final_thesis_title_en" rows="3" value={student.final_thesis_title_en || student.thesis_title_en || ''} onChange={handleInputChange} placeholder="— ยังไม่มีข้อมูล —"></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>วันที่สำเร็จการศึกษา</label>
                            <input name="graduation_date" type="date" value={student.graduation_date?.split('T')[0] || ''} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>วันที่สอบจบ</label>
                            <input name="final_exam_date" type="date" value={student.final_exam_date?.split('T')[0] || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3><FontAwesomeIcon icon={faClipboardCheck} /> ผลการทดสอบอื่นๆ</h3>
                <div className={styles.cardBody}>
                    <div className={styles.formSection}>
                        <h4>การสอบวัดคุณสมบัติ</h4>
                        <div className={`${styles.formGrid} ${styles.threeCols}`}>
                            <div className={styles.formGroup}>
                                <label>ผลการสอบ</label>
                                <select name="qualification_status" value={student.qualification_status || ''} onChange={handleInputChange}>
                                    {passOptions}
                                </select>
                            </div>
                             <div className={styles.formGroup}>
                                <label>วันที่ผ่านการสอบ</label>
                                <input name="qualification_date" type="date" value={student.qualification_date?.split('T')[0] || qeExamDoc?.exam_date?.split('T')[0] || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                     <div className={styles.formSection}>
                        <h4>การสอบภาษาอังกฤษ (ปริญญาโท)</h4>
                        <div className={`${styles.formGrid} ${styles.threeCols}`}>
                             <div className={styles.formGroup}>
                                <label>ผลคะแนนรับเข้า</label>
                                <select name="eng_master_entrance_status" value={student.eng_master_entrance_status || ''} onChange={handleInputChange}>
                                    {passOptions}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>ผลคะแนนจบ</label>
                                <select name="eng_master_exit_status" value={student.eng_master_exit_status || ''} onChange={handleInputChange}>
                                    {passOptions}
                                </select>
                            </div>
                             <div className={styles.formGroup}>
                                <label>วันที่ผ่านเกณฑ์</label>
                                <input name="eng_master_date" type="date" value={student.eng_master_date?.split('T')[0] || (engExamDoc && student.degree === 'ปริญญาโท' ? engExamDoc.exam_date?.split('T')[0] : '')} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.formSection}>
                        <h4>การสอบภาษาอังกฤษ (ปริญญาเอก)</h4>
                        <div className={`${styles.formGrid} ${styles.threeCols}`}>
                             <div className={styles.formGroup}>
                                <label>ผลคะแนนรับเข้า</label>
                                <select name="eng_phd_entrance_status" value={student.eng_phd_entrance_status || ''} onChange={handleInputChange}>
                                    {passOptions}
                                </select>
                            </div>
                             <div className={styles.formGroup}>
                                <label>ผลคะแนนจบ</label>
                                <select name="eng_phd_exit_status" value={student.eng_phd_exit_status || ''} onChange={handleInputChange}>
                                    {passOptions}
                                </select>
                            </div>
                             <div className={styles.formGroup}>
                                <label>วันที่ผ่านเกณฑ์</label>
                                <input name="eng_phd_date" type="date" value={student.eng_phd_date?.split('T')[0] || (engExamDoc && student.degree === 'ปริญญาเอก' ? engExamDoc.exam_date?.split('T')[0] : '')} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const CommitteeSection = ({ student, advisors, handleInputChange }) => {
    const renderAdvisorOptions = (placeholder, includeNone = false) => (
        <>
            <option value="">-- {placeholder} --</option>
            {advisors.map(adv => (
                <option key={adv.advisor_id} value={adv.advisor_id}>
                    {`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}
                </option>
            ))}
        </>
    );

    return (
        <div className={styles.card}>
            <h3><FontAwesomeIcon icon={faUsers} /> คณะกรรมการสอบวิทยานิพนธ์</h3>
            <div className={styles.cardBody}>
                <div className={styles.formSection}>
                    <h4>อาจารย์ที่ปรึกษา</h4>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาหลัก</label>
                            <select name="main_advisor_id" value={student.main_advisor_id || ''} onChange={handleInputChange}>
                                {renderAdvisorOptions('เลือกอาจารย์')}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาร่วม 1</label>
                            <select name="co_advisor1_id" value={student.co_advisor1_id || ''} onChange={handleInputChange}>
                                {renderAdvisorOptions('ไม่มี', true)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาร่วม 2</label>
                            <select name="co_advisor2_id" value={student.co_advisor2_id || ''} onChange={handleInputChange}>
                                {renderAdvisorOptions('ไม่มี', true)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h4>คณะกรรมการสอบ</h4>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}>
                            <label>ประธานกรรมการ</label>
                            <select name="committee_chair_id" value={student.committee_chair_id || ''} onChange={handleInputChange}>
                                {renderAdvisorOptions('เลือกประธาน')}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>กรรมการ (คนที่ 5)</label>
                            <select name="committee_member5_id" value={student.committee_member5_id || ''} onChange={handleInputChange}>
                                {renderAdvisorOptions('เลือกกรรมการ')}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h4>คณะกรรมการสำรอง</h4>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}>
                            <label>กรรมการ (อาจารย์บัณฑิตพิเศษภายนอก)</label>
                            <select name="committee_external_reserve_id" value={student.committee_external_reserve_id || ''} onChange={handleInputChange}>
                                {renderAdvisorOptions('เลือกกรรมการ (ภายนอก)')}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>กรรมการ (อาจารย์ภายใน)</label>
                            <select name="committee_internal_reserve_id" value={student.committee_internal_reserve_id || ''} onChange={handleInputChange}>
                                {renderAdvisorOptions('เลือกกรรมการ (ภายใน)')}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PublicationsSection = ({ student, handlePublicationsChange, handleRelatedFilesChange }) => {
    // --- State สำหรับ UI ของ Publications ---
    const [isAddingPublication, setIsAddingPublication] = useState(false);
    const [newPublication, setNewPublication] = useState({ title: '', type: '', file: null });
    const [editingPubIndex, setEditingPubIndex] = useState(null);
    const [editingPubData, setEditingPubData] = useState({});

    // --- State สำหรับ UI ของ Related Files ---
    const [isAddingFile, setIsAddingFile] = useState(false);
    const [newFile, setNewFile] = useState({ title: '', file: null });
    const [editingFileIndex, setEditingFileIndex] = useState(null);
    const [editingFileData, setEditingFileData] = useState({});

    // --- ฟังก์ชันสำหรับ "ผลงานตีพิมพ์" ---
    const handleAddPublication = () => {
        const updated = [...(student.publications || []), { ...newPublication, fileName: newPublication.file?.name, url: '#' }];
        handlePublicationsChange(updated);
        setIsAddingPublication(false);
        setNewPublication({ title: '', type: '', file: null });
    };
    const handleDeletePublication = (indexToDelete) => {
        if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
            const updated = (student.publications || []).filter((_, index) => index !== indexToDelete);
            handlePublicationsChange(updated);
        }
    };
    const handleEditPublication = (pub, index) => {
        setEditingPubIndex(index);
        setEditingPubData(pub);
    };
    const handleSavePublication = (indexToSave) => {
        const updated = (student.publications || []).map((pub, index) => 
            index === indexToSave ? editingPubData : pub
        );
        handlePublicationsChange(updated);
        setEditingPubIndex(null);
    };

    // --- ฟังก์ชันสำหรับ "เอกสารที่เกี่ยวข้อง" ---
    const handleAddFile = () => {
        const updatedFiles = [...student.related_files || [], { ...newFile, fileName: newFile.file?.name, url: '#' }];
        handleRelatedFilesChange(updatedFiles);
        setIsAddingFile(false);
        setNewFile({ title: '', file: null });
    };
    const handleDeleteFile = (indexToDelete) => {
        if (window.confirm('คุณต้องการลบไฟล์นี้ใช่หรือไม่?')) {
            const updatedFiles = (student.related_files || []).filter((_, index) => index !== indexToDelete);
            handleRelatedFilesChange(updatedFiles);
        }
    };
    const handleEditFile = (file, index) => {
        setEditingFileIndex(index);
        setEditingFileData(file);
    };
    const handleSaveFile = (indexToSave) => {
        const updatedFiles = (student.related_files || []).map((file, index) => 
            index === indexToSave ? editingFileData : file
        );
        handleRelatedFilesChange(updatedFiles);
        setEditingFileIndex(null);
    };

    return (
        <>
            <div className={styles.card}>
                <div className={styles.tableHeader}>
                    <h4><FontAwesomeIcon icon={faFileAlt} /> ผลงานตีพิมพ์เพื่อสำเร็จการศึกษา</h4>
                    <button className={styles.btnSecondary} onClick={() => setIsAddingPublication(true)} disabled={isAddingPublication}>
                        <FontAwesomeIcon icon={faPlus} /> เพิ่มผลงานตีพิมพ์
                    </button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>ชื่อผลงาน</th>
                                <th>ลักษณะการตีพิมพ์ผลงาน</th>
                                <th>ไฟล์แนบเอกสาร</th>
                                <th className={styles.actionCell}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(student.publications || []).map((pub, index) => (
                                editingPubIndex === index ? (
                                <tr key={index} className={styles.newRow}>
                                    <td><input type="text" value={editingPubData.title} onChange={(e) => setEditingPubData({...editingPubData, title: e.target.value})} /></td>
                                    <td><input type="text" value={editingPubData.type} onChange={(e) => setEditingPubData({...editingPubData, type: e.target.value})} /></td>
                                    <td><input type="file" /></td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtnConfirm} onClick={() => handleSavePublication(index)} title="บันทึก"><FontAwesomeIcon icon={faSave} /></button>
                                        <button className={styles.actionBtnCancel} onClick={() => setEditingPubIndex(null)} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
                                    </td>
                                </tr>
                                ) : (
                                <tr key={index}>
                                    <td>{pub.title || '-'}</td>
                                    <td>{pub.type || '-'}</td>
                                    <td>
                                        {pub.url && pub.fileName ? (
                                            <a href={pub.url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                                                {pub.fileName}
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtn} title="แก้ไข" onClick={() => handleEditPublication(pub, index)}><FontAwesomeIcon icon={faPencilAlt} /></button>
                                        <button className={styles.actionBtn} title="ลบ" onClick={() => handleDeletePublication(index)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                    </td>
                                </tr>
                                )
                            ))}
                            
                            {isAddingPublication && (
                                <tr className={styles.newRow}>
                                    <td><input type="text" placeholder="กรอกชื่อผลงาน" value={newPublication.title} onChange={(e) => setNewPublication({...newPublication, title: e.target.value})} /></td>
                                    <td><input type="text" placeholder="กรอกลักษณะการตีพิมพ์" value={newPublication.type} onChange={(e) => setNewPublication({...newPublication, type: e.target.value})} /></td>
                                    <td><input type="file" onChange={(e) => setNewPublication({...newPublication, file: e.target.files[0]})} /></td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtnConfirm} onClick={handleAddPublication} title="ยืนยัน"><FontAwesomeIcon icon={faCheck} /></button>
                                        <button className={styles.actionBtnCancel} onClick={() => setIsAddingPublication(false)} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
                                    </td>
                                </tr>
                            )}

                            {(student.publications || []).length === 0 && !isAddingPublication && (
                                <tr>
                                    <td colSpan="4" className={styles.noDataRow}>ยังไม่มีข้อมูลผลงานตีพิมพ์</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

           <div className={styles.card}>
                <div className={styles.tableHeader}>
                    <h4><FontAwesomeIcon icon={faFileAlt} /> เอกสารที่เกี่ยวข้อง (ไฟล์แนบ)</h4>
                    <button className={styles.btnSecondary} onClick={() => setIsAddingFile(true)} disabled={isAddingFile}>
                        <FontAwesomeIcon icon={faPlus} /> เพิ่มเอกสารแนบ
                    </button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>ชื่อเรื่อง</th>
                                <th>ไฟล์แนบเอกสาร</th>
                                <th className={styles.actionCell}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(student.related_files || []).map((file, index) => (
                                editingFileIndex === index ? (
                                <tr key={index} className={styles.newRow}>
                                    <td><input type="text" value={editingFileData.title} onChange={(e) => setEditingFileData({...editingFileData, title: e.target.value})} /></td>
                                    <td><input type="file" /></td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtnConfirm} onClick={() => handleSaveFile(index)} title="บันทึก"><FontAwesomeIcon icon={faSave} /></button>
                                        <button className={styles.actionBtnCancel} onClick={() => setEditingFileIndex(null)} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
                                    </td>
                                </tr>
                                ) : (
                                <tr key={index}>
                                    <td>{file.title || '-'}</td>
                                    <td>
                                        {file.url && file.fileName ? (
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                                                {file.fileName}
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtn} title="แก้ไข" onClick={() => handleEditFile(file, index)}><FontAwesomeIcon icon={faPencilAlt} /></button>
                                        <button className={styles.actionBtn} title="ลบ" onClick={() => handleDeleteFile(index)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                    </td>
                                </tr>
                                )
                            ))}

                            {isAddingFile && (
                                <tr className={styles.newRow}>
                                    <td><input type="text" placeholder="กรอกชื่อเรื่อง" value={newFile.title} onChange={(e) => setNewFile({...newFile, title: e.target.value})} /></td>
                                    <td><input type="file" onChange={(e) => setNewFile({...newFile, file: e.target.files[0]})} /></td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtnConfirm} onClick={handleAddFile} title="ยืนยัน"><FontAwesomeIcon icon={faCheck} /></button>
                                        <button className={styles.actionBtnCancel} onClick={() => setIsAddingFile(false)} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
                                    </td>
                                </tr>
                            )}
                            
                            {(student.related_files || []).length === 0 && !isAddingFile && (
                            <tr>
                                    <td colSpan="3" className={styles.noDataRow}>ยังไม่มีเอกสารแนบ</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const HistorySection = ({ documents }) => {
    const navigate = useNavigate();
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH');
    };

    return (
        <div className={styles.card}>
            <h3><FontAwesomeIcon icon={faHistory} /> ประวัติการยื่นเอกสาร</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.historyTable}>
                    <thead>
                        <tr>
                            <th>ชื่อเอกสาร</th>
                            <th>วันที่ยื่น</th>
                            <th>วันที่อนุมัติ</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents && documents.length > 0 ? documents.map(doc => (
                            <tr 
                                key={doc.doc_id} 
                                className={styles.clickableRow} 
                                onClick={() => navigate(`/admin/docs/${doc.doc_id}`)}
                            >
                                <td>{doc.title}</td>
                                <td>{formatDate(doc.submitted_date)}</td>
                                <td>{formatDate(doc.action_date)}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[doc.status.toLowerCase().replace(/\s/g, '')]}`}>
                                        {doc.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                                    ไม่พบประวัติการยื่นเอกสาร
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main Page Component ---
function ManageStudentDetailPage() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const isNew = studentId === 'new'; // ✅ 3. ตรวจสอบโหมด 'เพิ่ม' หรือ 'แก้ไข'

    const [activeSection, setActiveSection] = useState('account');
    
    // ✅ 4. ใช้ State เริ่มต้นสำหรับ studentData เพื่อรองรับฟอร์มเปล่า
    const [studentData, setStudentData] = useState(null);
    const [originalStudent, setOriginalStudent] = useState(null);
    const [relatedData, setRelatedData] = useState({ allDocs: [], advisors: [] });
    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            // ✅ รีเซ็ต error ทุกครั้งที่เริ่มโหลดใหม่
            setError(null); 
            setLoading(true);

            try {
                const advisorsRes = await fetch('/data/advisor.json');
                if (!advisorsRes.ok) throw new Error('ไม่สามารถโหลดข้อมูลอาจารย์ได้');
                const advisors = await advisorsRes.json();
                
                if (isNew) {
                    // --- โหมดเพิ่มนักศึกษา ---
                    setRelatedData({ allDocs: [], advisors });
                    setStudentData(INITIAL_NEW_STUDENT);
                    setOriginalStudent(_.cloneDeep(INITIAL_NEW_STUDENT));
                } else {
                    // --- โหมดแก้ไข (Logic เดิม) ---
                    const savedStudents = JSON.parse(localStorage.getItem('savedStudents') || '[]');
                    const savedStudent = savedStudents.find(s => s.student_id === studentId);

                    let currentStudent;
                    if (savedStudent) {
                        currentStudent = savedStudent;
                    } else {
                        const studentsRes = await fetch('/data/student.json');
                        const students = await studentsRes.json();
                        currentStudent = students.find(s => s.student_id === studentId);
                    }

                    if (!currentStudent) throw new Error("ไม่พบข้อมูลนักศึกษา");

                    setStudentData(currentStudent);
                    setOriginalStudent(_.cloneDeep(currentStudent));
                    
                    const listKeys = ['localStorage_pendingDocs', 'localStorage_waitingAdvisorDocs', 'localStorage_approvedDocs', 'localStorage_rejectedDocs'];
                    let allLocalStorageDocs = [];
                    listKeys.forEach(key => {
                        allLocalStorageDocs.push(...JSON.parse(localStorage.getItem(key) || '[]'));
                    });
                    const studentDocs = allLocalStorageDocs.filter(doc => doc.student_email === currentStudent.email);
                    
                    setRelatedData({ allDocs: studentDocs, advisors });
                }
            } catch (err) {
                setError(err.message);
            } finally {
                // ✅ ให้ setLoading(false) อยู่นอก try...catch และทำงานที่ท้ายสุดเสมอ
                setLoading(false);
            }
        };
        loadData();
    }, [studentId, isNew]);

    // --- Check for Unsaved Changes ---
    useEffect(() => {
        if (originalStudent && studentData) {
            const hasChanges = !_.isEqual(originalStudent, studentData);
            setIsDirty(hasChanges);
        }
    }, [studentData, originalStudent]);
    
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);


    // --- Handlers ---
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setStudentData(prev => ({ ...prev, [name]: value }));
    }, []);
    
    const handleNestedChange = useCallback((section, name, value) => {
        setStudentData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value
            }
        }));
    }, []);

    const handlePublicationsChange = useCallback((newPublications) => {
        setStudentData(prev => ({ ...prev, publications: newPublications }));
    }, []);
    
    const handleRelatedFilesChange = useCallback((newFiles) => {
        setStudentData(prev => ({ ...prev, related_files: newFiles }));
    }, []);

    const handleSave = () => {
        // ✅ 6. ปรับ Logic การบันทึกข้อมูล
        if (!isDirty && !isNew) {
            alert("ไม่มีการเปลี่ยนแปลงที่ต้องบันทึก");
            return;
        }

        // Basic validation for new student
        if (isNew) {
            if (!studentData.student_id || !studentData.email || !studentData.password) {
                alert("กรุณากรอกรหัสนักศึกษา, อีเมล และรหัสผ่านให้ครบถ้วน");
                setActiveSection('account');
                return;
            }
            if (studentData.password !== studentData.confirm_password) {
                alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
                setActiveSection('account');
                return;
            }
        }
        
        console.log("Saving data:", studentData);
        let allStudents = JSON.parse(localStorage.getItem('savedStudents') || '[]');

        if (isNew) {
            // โหมดเพิ่ม: เพิ่มนักศึกษาใหม่เข้าไปใน list
            const existingStudent = allStudents.find(s => s.student_id === studentData.student_id);
            if (existingStudent) {
                alert("มีรหัสนักศึกษานี้ในระบบแล้ว กรุณาใช้รหัสอื่น");
                return;
            }
            // ลบ confirm_password ออกก่อนบันทึก
            const finalStudentData = { ...studentData };
            delete finalStudentData.confirm_password;

            allStudents.push(finalStudentData);
            localStorage.setItem('savedStudents', JSON.stringify(allStudents));
            alert(`เพิ่มนักศึกษาใหม่ (${studentData.first_name_th}) สำเร็จ!`);
            navigate('/admin/manage-users');
        } else {
            // โหมดแก้ไข: ใช้ Logic เดิม
            const studentIndex = allStudents.findIndex(s => s.student_id === studentId);
            if (studentIndex > -1) {
                allStudents[studentIndex] = studentData;
            } else {
                // This case should not happen in edit mode, but as a fallback
                allStudents.push(studentData); 
            }
            localStorage.setItem('savedStudents', JSON.stringify(allStudents));
            setOriginalStudent(_.cloneDeep(studentData));
            alert("บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว");
        }
    };

    const handleBackNavigation = () => {
        if (isDirty && !window.confirm("คุณยังไม่ได้บันทึกข้อมูล ต้องการจะออกจากหน้านี้หรือไม่?")) {
            return;
        }
        navigate('/admin/manage-users');
    };

    const renderSection = () => {
        if (!studentData) return null;
        switch (activeSection) {
            case 'account':
                return <AccountSection 
                            student={studentData} 
                            handleInputChange={handleInputChange} 
                            isNew={isNew} // ✅ ส่ง isNew prop
                        />;
            case 'thesis': 
                return <ThesisSection 
                            student={studentData} 
                            advisors={relatedData.advisors} 
                            documents={relatedData.allDocs}
                            handleInputChange={handleInputChange} 
                        />;
            case 'committee': 
                return <CommitteeSection 
                            student={studentData} 
                            advisors={relatedData.advisors} 
                            handleInputChange={handleInputChange} 
                        />;
            case 'publications': 
                return <PublicationsSection 
                            student={studentData} 
                            handlePublicationsChange={handlePublicationsChange}
                            handleRelatedFilesChange={handleRelatedFilesChange} 
                        />;
            case 'history': 
                return <HistorySection documents={relatedData.allDocs} />;
            case 'info':
            default:
                return <InfoSection 
                            student={studentData} 
                            handleInputChange={handleInputChange} 
                            handleNestedChange={handleNestedChange}
                            isNew={isNew} // ✅ ส่ง isNew prop
                        />;
        }
    };

    if (loading) return <div className={styles.pageContainer}>กำลังโหลดข้อมูลนักศึกษา...</div>;
    if (error) return <div className={styles.pageContainer}>เกิดข้อผิดพลาด: {error}</div>;
    // ✅✅✅ เพิ่ม 3 บรรทัดนี้เข้าไปตรงนี้ครับ ✅✅✅
    if (!studentData) {
        return <div className={styles.pageContainer}>กำลังเตรียมฟอร์ม...</div>;
    }

    return (
        <div className={styles.pageLayout}>
            <SidebarManageStudent 
                student={studentData}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onBack={handleBackNavigation}
                isNew={isNew} // ✅ ส่ง isNew prop
            />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                     <h1>
                        <FontAwesomeIcon icon={faUserGraduate} /> 
                        {/* ✅ 7. เปลี่ยน Title ตามโหมด */}
                        {isNew ? 'เพิ่มข้อมูลนักศึกษาใหม่' : 'จัดการข้อมูลนักศึกษา'}
                     </h1>
                     <button className={styles.saveButton} onClick={handleSave}>
                         <FontAwesomeIcon icon={faSave} /> 
                         {/* ✅ 8. เปลี่ยนข้อความในปุ่มตามโหมด */}
                         {isNew ? 'สร้างบัญชีนักศึกษา' : 'บันทึกการเปลี่ยนแปลง'}
                     </button>
                </div>
                {renderSection()}
            </main>
        </div>
    );
}

export default ManageStudentDetailPage;