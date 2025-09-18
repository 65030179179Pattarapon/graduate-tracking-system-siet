import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './ManageStudentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ✅✅✅ แก้ไขบรรทัดนี้ ✅✅✅
import { 
    faUserCog, faUser, faBook, faUsers, faFileAlt, 
    faHistory, faArrowLeft, faSave, faTimesCircle,
    faUserGraduate
} from '@fortawesome/free-solid-svg-icons';

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
            <div className={styles.studentProfileCard}>
                <div className={styles.studentName}>{student.first_name_th} {student.last_name_th}</div>
                <div className={styles.studentId}>รหัสนักศึกษา: {student.student_id}</div>
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

const AccountSection = ({ student }) => (
    <div className={styles.card}>
        <h3>การจัดการบัญชี</h3>
        <div className={styles.cardBody}>
            <div className={styles.formSection}>
                <h4>ข้อมูลปัจจุบัน</h4>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}><label>อีเมลปัจจุบัน (ไม่สามารถแก้ไขได้)</label><input type="email" value={student.email || ''} disabled /></div>
                    <div className={styles.formGroup}><label>รหัสผ่านปัจจุบัน</label><input type="password" placeholder="กรอกเพื่อยืนยันการเปลี่ยนแปลง" /></div>
                </div>
            </div>
            <div className={styles.formSection}>
                <h4>แก้ไขข้อมูลบัญชี</h4>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}><label>อีเมลใหม่</label><input type="email" placeholder="กรอกอีเมลใหม่" /></div>
                    <div className={styles.formGroup}></div> {/* Empty cell for alignment */}
                    <div className={styles.formGroup}><label>รหัสผ่านใหม่</label><input type="password" placeholder="กรอกรหัสผ่านใหม่" /></div>
                    <div className={styles.formGroup}><label>ยืนยันรหัสผ่านใหม่</label><input type="password" placeholder="ยืนยันรหัสผ่านใหม่" /></div>
                </div>
            </div>
        </div>
    </div>
);

const InfoSection = ({ student }) => (
    <>
        <div className={styles.card}>
            <h3>ข้อมูลทั่วไป</h3>
            <div className={styles.cardBody}>
                <div className={`${styles.formGrid} ${styles.threeCols}`}>
                    <div className={styles.formGroup}><label>คำนำหน้า (ไทย)</label><input type="text" defaultValue={student.prefix_th || ''} /></div>
                    <div className={styles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" defaultValue={student.first_name_th || ''} /></div>
                    <div className={styles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" defaultValue={student.last_name_th || ''} /></div>
                    <div className={styles.formGroup}><label>คำนำหน้า (อังกฤษ)</label><input type="text" defaultValue={student.prefix_en || ''} /></div>
                    <div className={styles.formGroup}><label>ชื่อ (อังกฤษ)</label><input type="text" defaultValue={student.first_name_en || ''} /></div>
                    <div className={styles.formGroup}><label>นามสกุล (อังกฤษ)</label><input type="text" defaultValue={student.last_name_en || ''} /></div>
                    <div className={styles.formGroup}><label>อีเมล</label><input type="email" defaultValue={student.email || ''} /></div>
                    <div className={styles.formGroup}><label>เบอร์โทรศัพท์</label><input type="tel" defaultValue={student.phone || ''} /></div>
                </div>
            </div>
        </div>
        <div className={styles.card}>
            <h3>ข้อมูลการศึกษา</h3>
            <div className={styles.cardBody}>
                 <div className={`${styles.formGrid} ${styles.threeCols}`}>
                    <div className={styles.formGroup}><label>ระดับการศึกษา</label><input type="text" defaultValue={student.degree || ''} /></div>
                    <div className={styles.formGroup}><label>หลักสูตร</label><input type="text" defaultValue={student.program || ''} /></div>
                    <div className={styles.formGroup}><label>สถานะนักศึกษา</label><input type="text" defaultValue={student.status || ''} /></div>
                </div>
            </div>
        </div>
    </>
);

const ThesisSection = ({ student }) => (
     <div className={styles.card}>
        <h3>ข้อมูลวิทยานิพนธ์</h3>
        <div className={styles.cardBody}>
            {/* Placeholder Content */}
            <p>ส่วนสำหรับแก้ไขข้อมูลวิทยานิพนธ์</p>
        </div>
    </div>
);

const CommitteeSection = ({ student, advisors }) => (
     <div className={styles.card}>
        <h3>คณะกรรมการสอบวิทยานิพนธ์</h3>
        <div className={styles.cardBody}>
            <div className={styles.formSection}>
                <h4>อาจารย์ที่ปรึกษา</h4>
                <div className={`${styles.formGrid} ${styles.threeCols}`}>
                    <div className={styles.formGroup}>
                        <label>อาจารย์ที่ปรึกษาหลัก</label>
                        <select defaultValue={student.main_advisor_id || ''}>
                            <option value="">-- เลือก --</option>
                            {advisors.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>อาจารย์ที่ปรึกษาร่วม 1</label>
                        <select defaultValue={student.co_advisor1_id || ''}>
                            <option value="">-- ไม่มี --</option>
                            {advisors.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                        </select>
                    </div>
                </div>
            </div>
             <div className={styles.formSection}>
                <h4>คณะกรรมการสอบ</h4>
                 {/* Placeholder Content */}
             </div>
        </div>
    </div>
);

const PublicationsSection = ({ student }) => (
     <div className={styles.card}>
        <h3>ผลงานตีพิมพ์และเอกสารที่เกี่ยวข้อง</h3>
        <div className={styles.cardBody}>
            {/* Placeholder Content */}
            <p>ส่วนสำหรับอัปโหลดและจัดการไฟล์</p>
        </div>
    </div>
);

const HistorySection = ({ documents }) => {
    const navigate = useNavigate();
    return (
        <div className={styles.card}>
            <h3>ประวัติการยื่นเอกสาร</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.historyTable}>
                    <thead>
                        <tr>
                            <th>ชื่อเอกสาร</th>
                            <th>วันที่ยื่น</th>
                            <th>สถานะ</th>
                            <th>ดูรายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents && documents.length > 0 ? documents.map(doc => (
                            <tr key={doc.doc_id}>
                                <td>{doc.title}</td>
                                <td>{new Date(doc.submitted_date).toLocaleDateString('th-TH')}</td>
                                <td><span className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()]}`}>{doc.status}</span></td>
                                <td>
                                    <Link to={`/admin/docs/${doc.doc_id}`} className={styles.linkButton}>ดูเอกสาร</Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>ไม่พบประวัติการยื่นเอกสาร</td>
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
    const [activeSection, setActiveSection] = useState('info');
    const [studentData, setStudentData] = useState(null);
    const [relatedData, setRelatedData] = useState({ allDocs: [], advisors: [] });
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

    const renderSection = () => {
        switch (activeSection) {
            case 'account': return <AccountSection student={studentData} />;
            case 'thesis': return <ThesisSection student={studentData} />;
            case 'committee': return <CommitteeSection student={studentData} advisors={relatedData.advisors} />;
            case 'publications': return <PublicationsSection student={studentData} />;
            case 'history': return <HistorySection documents={relatedData.allDocs} />;
            case 'info':
            default:
                return <InfoSection student={studentData} />;
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
            />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                     <h1><FontAwesomeIcon icon={faUserGraduate} /> จัดการข้อมูลนักศึกษา</h1>
                     <button className={styles.saveButton}><FontAwesomeIcon icon={faSave} /> บันทึกการเปลี่ยนแปลงทั้งหมด</button>
                </div>
                {renderSection()}
            </main>
        </div>
    );
}

export default ManageStudentDetailPage;