import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEdit, faTrash, faUserCircle, faGraduationCap, faSignature, faPaperclip, faPencilAlt, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// Helper Functions
const formatThaiDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};
const getStatusClass = (status) => {
    if (!status) return styles.pending;
    const approved = ['สำเร็จการศึกษา', 'อนุมัติแล้ว', 'ผ่าน', 'ผ่านเกณฑ์'];
    if (approved.includes(status)) return styles.approved;
    const rejected = ['ไม่อนุมัติ', 'ตีกลับ', 'ไม่ผ่าน', 'ไม่ผ่านเกณฑ์'];
    if (rejected.includes(status)) return styles.rejected;
    return styles.pending;
};

function ProfilePage() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [processedData, setProcessedData] = useState({});
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [profileImage, setProfileImage] = useState('/assets/images/placeholder.png');
    const [signatureImage, setSignatureImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const userEmail = localStorage.getItem("current_user");
                if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

                // --- ✅ แก้ไขการดึงข้อมูล ---
                const [students, advisors, programs, departments] = await Promise.all([
                    fetch("/data/student.json").then(res => res.json()),
                    fetch("/data/advisor.json").then(res => res.json()),
                    fetch("/data/structures/programs.json").then(res => res.json()),
                    fetch("/data/structures/departments.json").then(res => res.json()),
                ]);
                
                const user = students.find(s => s.email === userEmail);
                if (!user) throw new Error("ไม่พบข้อมูลนักศึกษา");
                
                const allUserDocuments = [...(user.documents || []), ...JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]').filter(doc => doc.student_email === userEmail)];
                const userApprovedDocs = allUserDocuments.filter(doc => doc.status === 'อนุมัติแล้ว' || doc.status === 'อนุมัติ');

                const findAdvisorName = (id) => {
                    if (!id) return '-';
                    const advisor = advisors.find(a => a.advisor_id === id);
                    return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : '-';
                };

                const approvedForm2 = allUserDocuments.find(doc => doc.type === 'ฟอร์ม 2' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'อนุมัติ'));
                
                setCurrentUser(user);
                setPhoneInput(user.phone || '');
                setProcessedData({
                    programName: programs.find(p => p.id === user.program_id)?.name || '-',
                    departmentName: departments.find(d => d.id === user.department_id)?.name || '-',
                    mainAdvisorName: findAdvisorName(user.main_advisor_id),
                    coAdvisor1Name: findAdvisorName(user.co_advisor1_id),
                    coAdvisor2Name: findAdvisorName(approvedForm2?.committee?.co_advisor2_id),
                    approvedEngTestDoc: allUserDocuments.find(doc => doc.type === 'ผลสอบภาษาอังกฤษ' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'ผ่านเกณฑ์')),
                    allApprovedFiles: userApprovedDocs.flatMap(doc => doc.files ? doc.files.map(file => ({...file, formTitle: doc.title})) : [])
                });

                const savedProfileImg = localStorage.getItem(`${userEmail}_profile_image`);
                if (savedProfileImg) setProfileImage(savedProfileImg);
                const savedSignatureImg = localStorage.getItem(`${userEmail}_signature_data`);
                if (savedSignatureImg) setSignatureImage(savedSignatureImg);
                // --- จบการแก้ไข ---

            } catch (err) {
                setError(err.message);
                console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์:", err);
            } finally {
                setLoading(false);
            }
        };
        loadProfileData();
    }, []);

    const handleSavePhone = () => {
        setCurrentUser(prev => ({ ...prev, phone: phoneInput }));
        // ควรมีการบันทึก phoneInput ลง student.json หรือ localStorage ในโปรเจกต์จริง
        alert("เบอร์โทรศัพท์ถูกบันทึกแล้ว (จำลอง)");
        setIsEditingPhone(false);
    };

    if (loading) return <div className={styles.loadingText}>กำลังโหลดข้อมูลโปรไฟล์...</div>;
    if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;
    if (!currentUser) return <div className={styles.loadingText}>ไม่พบข้อมูลผู้ใช้</div>;

    const fullname = `${currentUser.prefix_th} ${currentUser.first_name_th} ${currentUser.last_name_th}`.trim();

    return (
        <main className={styles.profileContainer}>
            <h1><FontAwesomeIcon icon={faUserCircle} /> โปรไฟล์ของฉัน</h1>
            <div className={styles.profileLayout}>
                {/* --- Left Column --- */}
                <div className={styles.mainProfileColumn}>
                    <section className={styles.profileCard}>
                        <div className={styles.profileHeader}>
                            <div className={styles.profilePictureWrapper}>
                                <img src={profileImage} alt="รูปโปรไฟล์" />
                                <label htmlFor="profile-picture-input" className={styles.editPictureBtn}>
                                    <FontAwesomeIcon icon={faCamera} />
                                </label>
                                <input type="file" id="profile-picture-input" style={{display: 'none'}} accept="image/*" />
                            </div>
                            <div className={styles.profileNameGroup}>
                                <h2>{fullname}</h2>
                                <p>รหัสนักศึกษา: {currentUser.student_id}</p>
                            </div>
                        </div>
                        <div className={styles.profileDetails}>
                            <h3>ข้อมูลส่วนตัว</h3>
                            <div className={styles.detailsGrid}>
                                <div><label>ระดับการศึกษา:</label><span>{currentUser.degree || '-'}</span></div>
                                <div><label>แผนการเรียน:</label><span>{currentUser.plan || '-'}</span></div>
                                <div><label>หลักสูตร/สาขา:</label><span>{processedData.programName}</span></div>
                                <div><label>ภาควิชา:</label><span>{processedData.departmentName}</span></div>
                                <div><label>คณะ:</label><span>{currentUser.faculty || '-'}</span></div>
                                <div><label>สถานะ:</label><span className={getStatusClass(currentUser.status)}>{currentUser.status || '-'}</span></div>
                                <div>
                                    <label>เบอร์โทรศัพท์:</label>
                                    <div className={styles.editableField}>
                                        {isEditingPhone ? (
                                            <>
                                                <input type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                                                <button onClick={handleSavePhone} className={styles.btnIcon} title="บันทึก"><FontAwesomeIcon icon={faSave} /></button>
                                                <button onClick={() => setIsEditingPhone(false)} className={styles.btnIcon} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <span>{currentUser.phone || '-'}</span>
                                                <button onClick={() => setIsEditingPhone(true)} className={styles.btnIcon} title="แก้ไข"><FontAwesomeIcon icon={faPencilAlt} /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div><label>อีเมล:</label><span>{currentUser.email || '-'}</span></div>
                            </div>
                        </div>
                    </section>
                    <section className={styles.profileCard}>
                        <h3><FontAwesomeIcon icon={faSignature} /> ลายเซ็นดิจิทัล</h3>
                         <div className={styles.signatureDisplayArea}>
                            {signatureImage ? <img src={signatureImage} alt="ลายเซ็น" /> : <p>ยังไม่มีลายเซ็น</p>}
                        </div>
                        <div className={styles.signatureActions}>
                            <button className={styles.btn}><FontAwesomeIcon icon={faEdit} /> แก้ไขลายเซ็น</button>
                            <button className={`${styles.btn} ${styles.btnDanger}`}><FontAwesomeIcon icon={faTrash} /> ลบลายเซ็น</button>
                        </div>
                    </section>
                </div>
                {/* --- Right Column --- */}
                <div className={styles.sideProfileColumn}>
                    <section className={styles.profileCard}>
                        <h3><FontAwesomeIcon icon={faGraduationCap} /> สรุปสถานะการศึกษา</h3>
                        <div className={styles.statusGroup}>
                            <h4 className={styles.groupTitle}>ข้อมูลวิทยานิพนธ์</h4>
                            <ul className={styles.statusListDetailed}>
                                <li><label>อาจารย์ที่ปรึกษาหลัก:</label><span>{processedData.mainAdvisorName}</span></li>
                                <li><label>อาจารย์ที่ปรึกษาร่วม 1:</label><span>{processedData.coAdvisor1Name}</span></li>
                                <li><label>อาจารย์ที่ปรึกษาร่วม 2:</label><span>{processedData.coAdvisor2Name}</span></li>
                            </ul>
                        </div>
                         <div className={styles.statusGroup}>
                            <h4 className={styles.groupTitle}>ผลการสอบภาษาอังกฤษ</h4>
                            <ul className={styles.statusListDetailed}>
                                <li><label>สถานะ:</label><span className={getStatusClass(processedData.approvedEngTestDoc?.status || currentUser.english_test_status)}>{processedData.approvedEngTestDoc?.status || currentUser.english_test_status || 'ยังไม่ยื่น'}</span></li>
                            </ul>
                        </div>
                    </section>
                     <section className={styles.profileCard}>
                        <h3><FontAwesomeIcon icon={faPaperclip} /> เอกสารแนบในระบบ (ที่อนุมัติแล้ว)</h3>
                         <ul className={styles.fileList}>
                            {processedData.allApprovedFiles && processedData.allApprovedFiles.length > 0 ? (
                                processedData.allApprovedFiles.map((file, index) => (
                                    <li key={index}>
                                        <label>{file.type} <span className={styles.textMuted}>(จาก: {file.formTitle})</span></label>
                                        <a href="#" onClick={(e) => e.preventDefault()}>{file.name}</a>
                                    </li>
                                ))
                            ) : (
                                <li className={styles.loadingText}>ยังไม่มีเอกสารแนบที่อนุมัติแล้ว</li>
                            )}
                         </ul>
                     </section>
                </div>
            </div>
        </main>
    );
}

export default ProfilePage;