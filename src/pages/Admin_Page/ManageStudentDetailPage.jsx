import React, { useState, useEffect, useCallback } from 'react'; // ✅ เพิ่ม useCallback ที่นี่
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './ManageStudentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ✅✅✅ แก้ไขบรรทัดนี้ ✅✅✅
import { 
    faUserCog, faUser, faBook, faUsers, faFileAlt, 
    faHistory, faArrowLeft, faSave,
    faUserGraduate, faEye, faEyeSlash, faSyncAlt,
    faUserTie, faClipboardCheck, faCheck, faTimes,
    faPlus, faPencilAlt, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash'; // ✅ เพิ่มบรรทัดนี้

// --- 1. Sidebar Component ---
const SidebarManageStudent = ({ student, activeSection, setActiveSection }) => {
    const navigate = useNavigate();
    const menuItems = [
        { id: 'account', icon: faUserCog, text: 'การจัดการบัญชี' },
        { id: 'info', icon: faUser, text: 'ข้อมูลทั่วไป/ข้อมูลการศึกษา' },
        { id: 'thesis', icon: faBook, text: 'ข้อมูลวิทยานิพนธ์' },
        { id: 'committee', icon: faUsers, text: 'คณะกรรมการสอบวิทยานิพนธ์' },
        { id: 'publications', icon: faFileAlt, text: 'ผลงานตีพิมพ์และเอกสาร' },
        { id: 'history', icon: faHistory, text: 'ประวัติการยื่นเอกสาร' },
    ];

    return (
        <aside className={styles.sidebar}>
            {/* ✅✅✅ ส่วนที่แก้ไขทั้งหมด ✅✅✅ */}
            <div className={styles.studentProfileCard}>
                <div className={styles.profileImageContainer}>
                    {student.profile_img ? (
                        <img src={student.profile_img} alt="Student Profile" className={styles.profileImage} />
                    ) : (
                        <div className={styles.noImagePlaceholder}>ไม่มีภาพ</div>
                    )}
                </div>
                <div className={styles.studentName}>
                    {student.prefix_th}{student.first_name_th} {student.last_name_th}
                </div>
                <div className={styles.studentId}>รหัสนักศึกษา: {student.student_id}</div>
                <div className={styles.studentEmail}>{student.email}</div>
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
            <button className={styles.sidebarBtn} onClick={() => navigate('/admin/manage-users')}>
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>กลับหน้ารายชื่อ</span>
            </button>
        </aside>
    );
};

// --- 2. Section Components ---

// ✅✅✅ ส่วนที่แก้ไข: นำโค้ด AccountSection ที่ถูกต้องมารวมไว้ที่นี่ ✅✅✅
const AccountSection = ({ student }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  return (
    <div className={styles.card}>
      <h3><FontAwesomeIcon icon={faUserCog} /> การจัดการบัญชี</h3>
      <div className={styles.cardBody}>
        <div className={styles.formSection}>
          <h4>ข้อมูลปัจจุบัน</h4>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>อีเมล (สำหรับเข้าสู่ระบบ)</label>
              <input type="email" value={student.email || ''} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>รหัสผ่านปัจจุบัน</label>
              <div className={styles.passwordInputWrapper}>
                <input 
                  type={showCurrentPassword ? 'text' : 'password'} 
                  value={student.password || ''} 
                  readOnly
                  className={styles.readOnlyInput}
                />
                <FontAwesomeIcon 
                  icon={showCurrentPassword ? faEyeSlash : faEye} 
                  className={styles.passwordIcon}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.formSection}>
          <h4>แก้ไขข้อมูลบัญชี</h4>
          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label>อีเมลใหม่</label>
                <input type="email" placeholder="กรอกอีเมลใหม่ (ถ้าต้องการเปลี่ยน)" />
            </div>
            <div className={styles.formGroup}>
              <label>รหัสผ่านใหม่</label>
              <div className={styles.passwordInputWrapper}>
                <input 
                  type="text" 
                  placeholder="คลิกปุ่มสุ่ม หรือกรอกรหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              <label>ยืนยันรหัสผ่านใหม่</label>
              <input type="text" value={newPassword} readOnly className={styles.readOnlyInput} placeholder="กรอกรหัสผ่านใหม่เพื่อยืนยัน" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoSection = ({ student }) => {
    // ข้อมูลสำหรับ Dropdowns ต่างๆ
    const academicData = {
        programsByDegree: {
            'ปริญญาโท': ["วท.ม. การศึกษาวิทยาศาสตร์และเทคโนโลยี", "วท.ม. คอมพิวเตอร์ศึกษา", "ค.อ.ม. นวัตกรรมและการวิจัยเพื่อการเรียนรู้", "วท.ม. การศึกษาเกษตร", "ค.อ.ม. การบริหารการศึกษา", "ค.อ.ม. วิศวกรรมไฟฟ้าสื่อสาร", "ค.อ.ม. เทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม"],
            'ปริญญาเอก': ["ค.อ.ด. นวัตกรรมและการวิจัยเพื่อการเรียนรู้", "ค.อ.ด. การบริหารการศึกษา", "ปร.ด. สาขาวิชาเทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม", "ปร.ด. คอมพิวเตอร์ศึกษา", "ปร.ด. การศึกษาเกษตร", "ปร.ด. วิศวกรรมไฟฟ้าศึกษา"]
        },
        majors: [
            'การศึกษาคณิตศาสตร์และเทคโนโลยี',
            'คอมพิวเตอร์ศึกษา',
            'นวัตกรรมและการวิจัยเพื่อการเรียนรู้',
            'การศึกษาเกษตร',
            'การบริหารการศึกษา',
            'วิศวกรรมไฟฟ้าสื่อสาร',
            'เทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม'
        ],
        entryTypes: ['ปกติ', 'พิเศษ', 'สมทบ'],
        studyPlans: ['แผน ก แบบ ก2', 'แบบ 1.1', 'แบบ 2.1']
    };

    const [selectedDegree, setSelectedDegree] = useState(student.degree || 'ปริญญาโท');
    const [gender, setGender] = useState(student.gender || 'ชาย');
    const [otherGender, setOtherGender] = useState('');

    useEffect(() => {
        // เมื่อ Component โหลด, เช็คว่าค่า gender ที่มีอยู่ไม่ใช่ 'ชาย' หรือ 'หญิง'
        if (student.gender && student.gender !== 'ชาย' && student.gender !== 'หญิง') {
            setGender('อื่นๆ');
            setOtherGender(student.gender);
        }
    }, [student.gender]);

     // ✅ 1. สร้าง Logic สำหรับสร้างรายการปีการศึกษาอัตโนมัติ
    const generateYearOptions = () => {
        const currentBuddhistYear = new Date().getFullYear() + 543;
        const years = [];
        // สร้างรายการย้อนหลัง 10 ปี (ปรับเปลี่ยนได้ตามต้องการ)
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
                        {/* รหัสนักศึกษา (เต็มความกว้าง) */}
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label>รหัสนักศึกษา</label>
                            <input type="text" value={student.student_id || ''} disabled />
                        </div>
                        {/* ข้อมูลชื่อภาษาไทย */}
                        <div className={styles.formGroup}><label>คำนำหน้า (ไทย)</label><input type="text" defaultValue={student.prefix_th || ''} /></div>
                        <div className={styles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" defaultValue={student.first_name_th || ''} /></div>
                        <div className={styles.formGroup}><label>ชื่อกลาง (ไทย)</label><input type="text" placeholder="(ถ้ามี)" defaultValue={student.middle_name_th || ''} /></div>
                        <div className={styles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" defaultValue={student.last_name_th || ''} /></div>
                        
                        {/* ข้อมูลชื่อภาษาอังกฤษ */}
                        <div className={styles.formGroup}>
                            <label>คำนำหน้า (อังกฤษ)</label>
                            <select defaultValue={student.prefix_en || ''}>
                                <option value="Mr.">Mr.</option>
                                <option value="Mrs.">Mrs.</option>
                                <option value="Ms.">Ms.</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}><label>First Name (อังกฤษ)</label><input type="text" defaultValue={student.first_name_en || ''} /></div>
                        <div className={styles.formGroup}><label>Middle Name (อังกฤษ)</label><input type="text" placeholder="(Optional)" defaultValue={student.middle_name_en || ''} /></div>
                        <div className={styles.formGroup}><label>Last Name (อังกฤษ)</label><input type="text" defaultValue={student.last_name_en || ''} /></div>
                        
                        {/* ข้อมูลติดต่อ */}
                        <div className={styles.formGroup}><label>อีเมล</label><input type="email" defaultValue={student.email || ''} /></div>
                        <div className={styles.formGroup}><label>เบอร์โทรศัพท์</label><input type="tel" defaultValue={student.phone || ''} /></div>
                        
                        {/* ✅✅✅ ส่วนแก้ไขสำหรับเพศ ✅✅✅ */}
                        <div className={styles.formGroup}>
                            <label>เพศ</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                <option value="ชาย">ชาย</option>
                                <option value="หญิง">หญิง</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>
                        
                        {/* แสดงช่องกรอกข้อมูลเมื่อเลือก "อื่นๆ" */}
                        {gender === 'อื่นๆ' && (
                             <div className={styles.formGroup}>
                                <label>ระบุเพศ</label>
                                <input 
                                    type="text" 
                                    placeholder="กรุณาระบุเพศ" 
                                    value={otherGender}
                                    onChange={(e) => setOtherGender(e.target.value)}
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
                            <select value={selectedDegree} onChange={(e) => setSelectedDegree(e.target.value)}>
                                <option value="ปริญญาโท">ปริญญาโท</option>
                                <option value="ปริญญาเอก">ปริญญาเอก</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>หลักสูตร</label>
                            <select defaultValue={student.program || ''}>
                                <option value="">-- เลือกหลักสูตร --</option>
                                {academicData.programsByDegree[selectedDegree]?.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>สาขาวิชา</label>
                            <select defaultValue={student.major || ''}>
                                 <option value="">-- เลือกสาขาวิชา --</option>
                                {academicData.majors.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>สถานะนักศึกษา</label>
                            <select defaultValue={student.student_status || ''}>
                                <option value="กำลังศึกษา">กำลังศึกษา</option>
                                <option value="พ้นสภาพ">พ้นสภาพ</option>
                                <option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ปีการศึกษาที่รับเข้า</label>
                            <select defaultValue={student.entry_year || ''}>
                                <option value="">-- เลือกปี --</option>
                                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ภาคการศึกษาที่รับเข้า</label>
                            <select defaultValue={student.entry_semester || ''}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="ภาคพิเศษ">ภาคพิเศษ</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ประเภทที่รับเข้า</label>
                            <select defaultValue={student.entry_type || ''}>
                                 <option value="">-- เลือกประเภท --</option>
                                {academicData.entryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>แผนการเรียน</label>
                            <select defaultValue={student.study_plan || ''}>
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

const ThesisSection = ({ student, advisors, documents }) => {
    // --- Logic การดึงข้อมูลที่เกี่ยวข้อง ---
    const mainAdvisor = advisors.find(a => a.advisor_id === student.main_advisor_id);
    const coAdvisor1 = advisors.find(a => a.advisor_id === student.co_advisor1_id);

    // หาข้อมูลจากฟอร์ม 2 ที่อนุมัติแล้ว
    const approvedForm2 = documents.find(d => d.type === 'ฟอร์ม 2' && d.status === 'อนุมัติแล้ว');
    const coAdvisor2 = approvedForm2 ? advisors.find(a => a.advisor_id === approvedForm2.committee?.co_advisor2_id) : null;
    
    // หาข้อมูลจากฟอร์มผลสอบ QE
    const qeExamDoc = documents.find(d => d.type === 'ผลสอบวัดคุณสมบัติ' && d.status === 'อนุมัติแล้ว');
    // หาข้อมูลจากฟอร์มผลสอบอังกฤษ
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
                            <textarea rows="3" defaultValue={student.thesis_title_th || ''}></textarea>
                        </div>
                        <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                            <label>ชื่อหัวข้อ (อังกฤษ)</label>
                            <textarea rows="3" defaultValue={student.thesis_title_en || ''}></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>วันที่ประกาศหัวข้อ</label>
                            <input type="date" defaultValue={student.proposal_approval_date?.split('T')[0] || ''} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>วันที่สอบหัวข้อ</label>
                            <input type="date" />
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
                            <textarea rows="3" defaultValue={student.thesis_title_th || ''} placeholder="— ยังไม่มีข้อมูล —"></textarea>
                        </div>
                        <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                            <label>ชื่อหัวข้อ (อังกฤษ)</label>
                            <textarea rows="3" defaultValue={student.thesis_title_en || ''} placeholder="— ยังไม่มีข้อมูล —"></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>วันที่สำเร็จการศึกษา</label>
                            <input type="date" defaultValue={student.graduation_date?.split('T')[0] || ''} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>วันที่สอบจบ</label>
                            <input type="date" />
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
                                <select defaultValue={qeExamDoc ? 'ผ่าน' : ''}>
                                    <option value="">-- ยังไม่มีข้อมูล --</option>
                                    <option value="ผ่าน">ผ่าน</option>
                                    <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                                </select>
                            </div>
                             <div className={styles.formGroup}>
                                <label>วันที่ผ่านการสอบ</label>
                                <input type="date" defaultValue={qeExamDoc?.exam_date?.split('T')[0] || ''}/>
                            </div>
                        </div>
                    </div>
                     <div className={styles.formSection}>
                        <h4>การสอบภาษาอังกฤษ (ปริญญาโท)</h4>
                        <div className={`${styles.formGrid} ${styles.threeCols}`}>
                             <div className={styles.formGroup}>
                                <label>ผลคะแนนรับเข้า</label>
                                <select defaultValue={engExamDoc && student.degree === 'ปริญญาโท' ? 'ผ่าน' : ''}>
                                    {passOptions}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>ผลคะแนนจบ</label>
                                <select>
                                    {passOptions}
                                </select>
                            </div>
                             <div className={styles.formGroup}>
                                <label>วันที่ผ่านเกณฑ์</label>
                                <input type="date" defaultValue={engExamDoc && student.degree === 'ปริญญาโท' ? engExamDoc.exam_date?.split('T')[0] : ''}/>
                            </div>
                        </div>
                    </div>
                    <div className={styles.formSection}>
                        <h4>การสอบภาษาอังกฤษ (ปริญญาเอก)</h4>
                        <div className={`${styles.formGrid} ${styles.threeCols}`}>
                             <div className={styles.formGroup}>
                                <label>ผลคะแนนรับเข้า</label>
                                <select defaultValue={engExamDoc && student.degree === 'ปริญญาเอก' ? 'ผ่าน' : ''}>
                                    {passOptions}
                                </select>
                            </div>
                             <div className={styles.formGroup}>
                                <label>ผลคะแนนจบ</label>
                                <select>
                                    {passOptions}
                                </select>
                            </div>
                             <div className={styles.formGroup}>
                                <label>วันที่ผ่านเกณฑ์</label>
                                <input type="date" defaultValue={engExamDoc && student.degree === 'ปริญญาเอก' ? engExamDoc.exam_date?.split('T')[0] : ''}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const CommitteeSection = ({ student, advisors }) => {
    // ฟังก์ชันสำหรับสร้าง Dropdown Options เพื่อลดความซ้ำซ้อน
    const renderAdvisorOptions = (includeNoneOption = false) => (
        <>
            <option value="">{includeNoneOption ? '-- ไม่มี --' : '-- เลือกอาจารย์ --'}</option>
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
                {/* --- ส่วนอาจารย์ที่ปรึกษา --- */}
                <div className={styles.formSection}>
                    <h4>อาจารย์ที่ปรึกษา</h4>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาหลัก</label>
                            <select defaultValue={student.main_advisor_id || ''}>
                                {renderAdvisorOptions()}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาร่วม 1</label>
                            <select defaultValue={student.co_advisor1_id || ''}>
                                {renderAdvisorOptions(true)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาร่วม 2</label>
                            <select defaultValue={student.co_advisor2_id || ''}>
                                {renderAdvisorOptions(true)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- ส่วนคณะกรรมการสอบ --- */}
                <div className={styles.formSection}>
                    <h4>คณะกรรมการสอบ</h4>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}>
                            <label>ประธานกรรมการ</label>
                            <select>
                                {renderAdvisorOptions()}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>กรรมการ (คนที่ 5)</label>
                            <select>
                                {renderAdvisorOptions()}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- ส่วนคณะกรรมการสำรอง --- */}
                <div className={styles.formSection}>
                    <h4>คณะกรรมการสำรอง</h4>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}>
                            <label>กรรมการ (อาจารย์บัณฑิตพิเศษภายนอก)</label>
                            <select>
                                {renderAdvisorOptions()}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>กรรมการ (อาจารย์ภายใน)</label>
                            <select>
                                {renderAdvisorOptions()}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PublicationsSection = ({ student }) => {
    const [publications, setPublications] = useState(student.publications || []);
    const [relatedFiles, setRelatedFiles] = useState(student.related_files || []);

    const [isAddingPublication, setIsAddingPublication] = useState(false);
    const [isAddingFile, setIsAddingFile] = useState(false);
    
    const [newPublication, setNewPublication] = useState({ title: '', type: '', file: null });
    const [newFile, setNewFile] = useState({ title: '', file: null });
    
    // ✅ 1. เพิ่ม State สำหรับจัดการ "โหมดแก้ไข"
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingData, setEditingData] = useState({});

    const handleAddPublication = () => {
        setPublications([...publications, { ...newPublication, fileName: newPublication.file?.name, url: '#' }]);
        setIsAddingPublication(false);
        setNewPublication({ title: '', type: '', file: null });
    };

    const handleAddFile = () => {
        setRelatedFiles([...relatedFiles, { ...newFile, fileName: newFile.file?.name, url: '#' }]);
        setIsAddingFile(false);
        setNewFile({ title: '', file: null });
    };

    // ✅ 2. เพิ่มฟังก์ชันสำหรับ "ลบ" ข้อมูล
    const handleDeletePublication = (indexToDelete) => {
        if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
            setPublications(publications.filter((_, index) => index !== indexToDelete));
        }
    };

    // ✅ 3. เพิ่มฟังก์ชันสำหรับ "เข้าสู่โหมดแก้ไข"
    const handleEditPublication = (pub, index) => {
        setEditingIndex(index);
        setEditingData(pub);
    };

    // ✅ 4. เพิ่มฟังก์ชันสำหรับ "บันทึกการแก้ไข"
    const handleSavePublication = (indexToSave) => {
        const updatedPublications = publications.map((pub, index) => 
            index === indexToSave ? editingData : pub
        );
        setPublications(updatedPublications);
        setEditingIndex(null); // ออกจากโหมดแก้ไข
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
                            {publications.map((pub, index) => (
                                editingIndex === index ? (
                                // ✅ 5. แสดงแถวแก้ไขเมื่ออยู่ในโหมดแก้ไข
                                <tr key={index} className={styles.newRow}>
                                    <td><input type="text" value={editingData.title} onChange={(e) => setEditingData({...editingData, title: e.target.value})} /></td>
                                    <td><input type="text" value={editingData.type} onChange={(e) => setEditingData({...editingData, type: e.target.value})} /></td>
                                    <td><input type="file" /></td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtnConfirm} onClick={() => handleSavePublication(index)} title="บันทึก"><FontAwesomeIcon icon={faSave} /></button>
                                        <button className={styles.actionBtnCancel} onClick={() => setEditingIndex(null)} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
                                    </td>
                                </tr>
                                ) : (
                                // แถวแสดงผลปกติ
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

                            {publications.length === 0 && !isAddingPublication && (
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
                            {/* ✅✅✅ แก้ไข/เพิ่มเติมโค้ดทั้งหมดใน tbody นี้ ✅✅✅ */}
                            {relatedFiles.map((file, index) => (
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
                                        {/* เพิ่มปุ่มแก้ไข/ลบ สำหรับ relatedFiles ได้ที่นี่ */}
                                    </td>
                                </tr>
                            ))}

                            {/* --- แถวสำหรับเพิ่มข้อมูลเอกสารแนบ --- */}
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
                            
                            {relatedFiles.length === 0 && !isAddingFile && (
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
                            // ✅ ทำให้ทั้งแถวสามารถคลิกได้
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
    const [activeSection, setActiveSection] = useState('account');
    
    // --- State Management ---
    const [originalStudent, setOriginalStudent] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [relatedData, setRelatedData] = useState({ allDocs: [], advisors: [] });
    const [isDirty, setIsDirty] = useState(false); // Track if there are unsaved changes
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [students, advisors] = await Promise.all([
                    fetch('/data/student.json').then(res => res.json()),
                    fetch('/data/advisor.json').then(res => res.json())
                ]);
                
                const currentStudent = students.find(s => s.student_id === studentId);
                if (!currentStudent) throw new Error("ไม่พบข้อมูลนักศึกษา");

                setStudentData(currentStudent);
                setOriginalStudent(_.cloneDeep(currentStudent)); // Save a deep copy for comparison

                const listKeys = ['localStorage_pendingDocs', 'localStorage_waitingAdvisorDocs', 'localStorage_approvedDocs', 'localStorage_rejectedDocs'];
                let allLocalStorageDocs = [];
                listKeys.forEach(key => {
                    allLocalStorageDocs.push(...JSON.parse(localStorage.getItem(key) || '[]'));
                });
                const studentDocs = allLocalStorageDocs.filter(doc => doc.student_email === currentStudent.email);
                
                setRelatedData({ allDocs: studentDocs, advisors });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [studentId]);

    // --- Check for Unsaved Changes ---
    useEffect(() => {
        const hasChanges = !_.isEqual(originalStudent, studentData);
        setIsDirty(hasChanges);

        const handleBeforeUnload = (event) => {
            if (hasChanges) {
                event.preventDefault();
                event.returnValue = ''; // For modern browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [studentData, originalStudent]);

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
    
    const handleSave = () => {
        if (!isDirty) {
            alert("ไม่มีการเปลี่ยนแปลงที่ต้องบันทึก");
            return;
        }
        
        console.log("Saving data:", studentData);
        // Here you would typically send the data to a server
        // For this example, we'll update the master student list in localStorage
        
        let allStudents = JSON.parse(localStorage.getItem('savedStudents') || '[]');
        const studentIndex = allStudents.findIndex(s => s.student_id === studentId);

        if (studentIndex > -1) {
            allStudents[studentIndex] = studentData;
        } else {
            // This case might not be necessary if you only edit existing students
            allStudents.push(studentData); 
        }
        
        localStorage.setItem('savedStudents', JSON.stringify(allStudents));
        setOriginalStudent(_.cloneDeep(studentData)); // Update original state after saving
        alert("บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว");
    };

    const handleBackNavigation = () => {
        if (isDirty && !window.confirm("คุณยังไม่ได้บันทึกข้อมูล ต้องการจะออกจากหน้านี้หรือไม่?")) {
            return; // Stay on the page if user cancels
        }
        navigate('/admin/manage-users');
    };


    const renderSection = () => {
        if (!studentData) return null;
        switch (activeSection) {
            case 'account': return <AccountSection student={studentData} handleInputChange={handleInputChange} />;
            case 'thesis': 
                return <ThesisSection 
                            student={studentData} 
                            advisors={relatedData.advisors} 
                            documents={relatedData.allDocs}
                            handleInputChange={handleInputChange} 
                        />;
            case 'committee': return <CommitteeSection student={studentData} advisors={relatedData.advisors} handleInputChange={handleInputChange} />;
            case 'publications': return <PublicationsSection student={studentData} handlePublicationsChange={handlePublicationsChange} />;
            case 'history': return <HistorySection documents={relatedData.allDocs} />;
            case 'info':
            default:
                return <InfoSection student={studentData} handleInputChange={handleInputChange} handleNestedChange={handleNestedChange} academicData={{}}/>;
        }
    };

    if (loading) return <div className={styles.pageContainer}>กำลังโหลดข้อมูลนักศึกษา...</div>;
    if (error) return <div className={styles.pageContainer}>เกิดข้อผิดพลาด: {error}</div>;

    return (
        <div className={styles.pageLayout}>
            <SidebarManageStudent 
                student={studentData}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onBack={handleBackNavigation}
            />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                     <h1><FontAwesomeIcon icon={faUserGraduate} /> จัดการข้อมูลนักศึกษา</h1>
                     <button className={styles.saveButton} onClick={handleSave}>
                         <FontAwesomeIcon icon={faSave} /> บันทึกการเปลี่ยนแปลงทั้งหมด
                     </button>
                </div>
                {renderSection()}
            </main>
        </div>
    );
}

export default ManageStudentDetailPage;