import React, { useState, useEffect, useRef } from 'react';
import styles from './ProfilePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCamera, faEdit, faTrash, faUserCircle, faGraduationCap, faSignature, 
    faPaperclip, faPencilAlt, faSave, faTimes, faClipboardCheck, faKey,
    faEye, faEyeSlash // 👈 เพิ่ม 2 ไอคอนนี้เข้าไป
} from '@fortawesome/free-solid-svg-icons';
import SignaturePad from 'react-signature-pad-wrapper';

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

    // Component ใหม่สำหรับการจัดการบัญชี
const AccountManagementSection = ({ currentUser, setCurrentUser }) => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    
    // ✅ 1. เพิ่ม State สำหรับควบคุมการแสดงผลของแต่ละช่อง
    const [visibility, setVisibility] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // ✅ 2. สร้างฟังก์ชันสำหรับสลับการแสดงผล
    const toggleVisibility = (field) => {
        setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSavePassword = () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            alert("กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน");
            return;
        }
        if (passwords.currentPassword !== currentUser.password) {
            alert("รหัสผ่านปัจจุบันไม่ถูกต้อง");
            return;
        }
        if (passwords.newPassword.length < 6) {
            alert("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
            return;
        }

        const userEmail = localStorage.getItem("current_user");
        const allStudents = JSON.parse(localStorage.getItem('savedStudents') || '[]');
        const updatedStudents = allStudents.map(student => {
            if (student.email === userEmail) {
                return { ...student, password: passwords.newPassword };
            }
            return student;
        });

        localStorage.setItem('savedStudents', JSON.stringify(updatedStudents));
        setCurrentUser(prev => ({ ...prev, password: passwords.newPassword }));
        
        alert("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        setIsEditingPassword(false);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <section className={styles.profileCard}>
            <h3><FontAwesomeIcon icon={faKey} /> การจัดการบัญชี</h3>
            <div className={styles.profileDetails}>
                {!isEditingPassword ? (
                    <button className={styles.btn} onClick={() => setIsEditingPassword(true)}>
                        <FontAwesomeIcon icon={faPencilAlt} /> เปลี่ยนรหัสผ่าน
                    </button>
                ) : (
                    <div className={styles.passwordForm}>
                        {/* ✅ 3. ปรับปรุง JSX ของแต่ละ Input */}
                        <div className={styles.formGroup}>
                            <label>รหัสผ่านปัจจุบัน</label>
                            <div className={styles.passwordInputWrapper}>
                                <input 
                                    type={visibility.current ? 'text' : 'password'} 
                                    name="currentPassword" 
                                    value={passwords.currentPassword} 
                                    onChange={handlePasswordChange} 
                                />
                                <FontAwesomeIcon 
                                    icon={visibility.current ? faEyeSlash : faEye} 
                                    className={styles.passwordIcon}
                                    onClick={() => toggleVisibility('current')}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>รหัสผ่านใหม่</label>
                            <div className={styles.passwordInputWrapper}>
                                <input 
                                    type={visibility.new ? 'text' : 'password'} 
                                    name="newPassword" 
                                    value={passwords.newPassword} 
                                    onChange={handlePasswordChange} 
                                />
                                <FontAwesomeIcon 
                                    icon={visibility.new ? faEyeSlash : faEye} 
                                    className={styles.passwordIcon}
                                    onClick={() => toggleVisibility('new')}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ยืนยันรหัสผ่านใหม่</label>
                            <div className={styles.passwordInputWrapper}>
                                <input 
                                    type={visibility.confirm ? 'text' : 'password'} 
                                    name="confirmPassword" 
                                    value={passwords.confirmPassword} 
                                    onChange={handlePasswordChange} 
                                />
                                <FontAwesomeIcon 
                                    icon={visibility.confirm ? faEyeSlash : faEye} 
                                    className={styles.passwordIcon}
                                    onClick={() => toggleVisibility('confirm')}
                                />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setIsEditingPassword(false)}>ยกเลิก</button>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSavePassword}>บันทึกรหัสผ่าน</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

function ProfilePage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [processedData, setProcessedData] = useState({});
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [profileImage, setProfileImage] = useState('/assets/images/placeholder.png');
    const [signatureImage, setSignatureImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCropModalOpen, setCropModalOpen] = useState(false);
    const cropperRef = useRef(null);

    const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
    const [signatureTab, setSignatureTab] = useState('draw');
    const signaturePadRef = useRef(null);
    const signatureFileInputRef = useRef(null);

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const userEmail = localStorage.getItem("current_user");
                if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

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
                const approvedEngMasterDoc = allUserDocuments.find(doc => doc.title?.includes("ปริญญาโท") && doc.type === 'ผลสอบภาษาอังกฤษ' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'ผ่านเกณฑ์'));
                const approvedEngPhdDoc = allUserDocuments.find(doc => doc.title?.includes("ปริญญาเอก") && doc.type === 'ผลสอบภาษาอังกฤษ' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'ผ่านเกณฑ์'));
                const approvedQEDoc = allUserDocuments.find(doc => doc.type === 'ผลสอบวัดคุณสมบัติ' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'ผ่าน'));

                setCurrentUser(user);
                setPhoneInput(user.phone || '');
                setProcessedData({
                    programName: programs.find(p => p.id === user.program_id)?.name || '-',
                    departmentName: departments.find(d => d.id === user.department_id)?.name || '-',
                    mainAdvisorName: findAdvisorName(user.main_advisor_id),
                    coAdvisor1Name: findAdvisorName(user.co_advisor1_id),
                    coAdvisor2Name: findAdvisorName(approvedForm2?.committee?.co_advisor2_id),
                    approvedEngMasterDoc,
                    approvedEngPhdDoc,
                    approvedQEDoc,
                    allApprovedFiles: userApprovedDocs.flatMap(doc => doc.files ? doc.files.map(file => ({...file, formTitle: doc.title})) : [])
                });

                const savedProfileImg = localStorage.getItem(`${userEmail}_profile_image`);
                if (savedProfileImg) setProfileImage(savedProfileImg);
                const savedSignatureImg = localStorage.getItem(`${userEmail}_signature_data`);
                if (savedSignatureImg) setSignatureImage(savedSignatureImg);

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
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) {
            alert("เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้ปัจจุบัน");
            return;
        }

        // 1. ✅ อ่านข้อมูลนักศึกษาทั้งหมดจาก Local Storage
        const allStudents = JSON.parse(localStorage.getItem('savedStudents') || '[]');

        // 2. ✅ หาและอัปเดตข้อมูลของนักศึกษาคนปัจจุบัน
        const updatedStudents = allStudents.map(student => {
            if (student.email === userEmail) {
                // ถ้าเจอนักศึกษาคนนี้ ให้คืนค่า object ใหม่พร้อมเบอร์โทรที่อัปเดต
                return { ...student, phone: phoneInput };
            }
            // ถ้าไม่ใช่ ให้คืนค่า student เดิม
            return student;
        });

        // 3. ✅ บันทึกข้อมูลที่อัปเดตแล้วทั้งหมดกลับลง Local Storage
        localStorage.setItem('savedStudents', JSON.stringify(updatedStudents));

        // 4. ✅ อัปเดต State ในหน้าเว็บเพื่อให้เห็นการเปลี่ยนแปลงทันที
        setCurrentUser(prev => ({ ...prev, phone: phoneInput }));
        
        alert("เบอร์โทรศัพท์ถูกบันทึกเรียบร้อยแล้ว");
        setIsEditingPhone(false);
    };

    const handleProfilePictureChange = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
                setCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleConfirmCrop = () => {
        if (cropperRef.current?.cropper) {
            const croppedImageData = cropperRef.current.cropper.getCroppedCanvas({
                width: 256, height: 256,
            }).toDataURL('image/png');
            setProfileImage(croppedImageData);
            const userEmail = localStorage.getItem("current_user");
            localStorage.setItem(`${userEmail}_profile_image`, croppedImageData);
            setCropModalOpen(false);
            setImageToCrop(null);
        }
    };
    
    const handleSaveSignature = () => {
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) return;
        let signatureData = null;
        if (signatureTab === 'draw') {
            if (signaturePadRef.current?.isEmpty()) {
                alert("กรุณาวาดลายเซ็นของคุณ");
                return;
            }
            signatureData = signaturePadRef.current.toDataURL('image/png');
            finalizeSaveSignature(userEmail, signatureData);
        } else {
            const file = signatureFileInputRef.current?.files[0];
            if (!file) {
                alert("กรุณาเลือกไฟล์รูปภาพ");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                finalizeSaveSignature(userEmail, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const finalizeSaveSignature = (userEmail, data) => {
        setSignatureImage(data);
        localStorage.setItem(`${userEmail}_signature_data`, data);
        localStorage.setItem(`${userEmail}_signed`, "true");
        alert("บันทึกลายเซ็นใหม่เรียบร้อยแล้ว");
        setSignatureModalOpen(false);
    }

    const handleDeleteSignature = () => {
        if (window.confirm("คุณต้องการลบลายเซ็นดิจิทัลใช่หรือไม่? การลบจะทำให้คุณต้องตั้งค่าลายเซ็นใหม่ทันที")) {
            const userEmail = localStorage.getItem("current_user");
            if (userEmail) {
                localStorage.removeItem(`${userEmail}_signature_data`);
                localStorage.removeItem(`${userEmail}_signed`);
                setSignatureImage(null);
                
                alert("ลบลายเซ็นเรียบร้อยแล้ว กรุณาตั้งค่าลายเซ็นใหม่เพื่อดำเนินการต่อ");
                
                setSignatureModalOpen(true);
            }
        }
    };

    if (loading) return <div className={styles.loadingText}>กำลังโหลดข้อมูลโปรไฟล์...</div>;
    if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;
    if (!currentUser) return <div className={styles.loadingText}>ไม่พบข้อมูลผู้ใช้</div>;

    const fullname = `${currentUser.prefix_th} ${currentUser.first_name_th} ${currentUser.last_name_th}`.trim();

    return (
        <>
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
                                    <input type="file" id="profile-picture-input" style={{display: 'none'}} accept="image/*" onChange={handleProfilePictureChange}/>
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
                                    <div><label>ประเภทรับเข้า:</label><span>{currentUser.admit_type || '-'}</span></div>
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

                         {/* ✅✅✅ เรียกใช้ Component ที่สร้างขึ้นมาตรงนี้ ✅✅✅ */}
                        <AccountManagementSection currentUser={currentUser} setCurrentUser={setCurrentUser} />

                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faSignature} /> ลายเซ็นดิจิทัล</h3>
                               <div className={styles.signatureDisplayArea}>
                                 {signatureImage ? <img src={signatureImage} alt="ลายเซ็น" /> : <p>ยังไม่มีลายเซ็น</p>}
                            </div>
                            <div className={styles.signatureActions}>
                                <button className={styles.btn} onClick={() => setSignatureModalOpen(true)}><FontAwesomeIcon icon={faEdit} /> แก้ไขลายเซ็น</button>
                                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDeleteSignature}><FontAwesomeIcon icon={faTrash} /> ลบลายเซ็น</button>
                            </div>
                        </section>
                    </div>

                    {/* --- Right Column --- */}
                    <div className={styles.sideProfileColumn}>
                        {/* ✅ 1. การ์ดข้อมูลวิทยานิพนธ์และอาจารย์ที่ปรึกษา */}
                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faGraduationCap} /> ข้อมูลวิทยานิพนธ์</h3>
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>รายละเอียดวิทยานิพนธ์</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>ชื่อ (ไทย):</label><span>{currentUser.thesis_title_th || '-'}</span></li>
                                    <li><label>ชื่อ (อังกฤษ):</label><span>{currentUser.thesis_title_en || '-'}</span></li>
                                </ul>
                            </div>
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>อาจารย์ที่ปรึกษา</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>ที่ปรึกษาหลัก:</label><span>{processedData.mainAdvisorName}</span></li>
                                    <li><label>ที่ปรึกษาร่วม 1:</label><span>{processedData.coAdvisor1Name}</span></li>
                                    <li><label>ที่ปรึกษาร่วม 2:</label><span>{processedData.coAdvisor2Name}</span></li>
                                </ul>
                            </div>
                        </section>

                        {/* ✅✅✅ โค้ดส่วนที่แก้ไขทั้งหมด ✅✅✅ */}
                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faClipboardCheck} /> สรุปผลการดำเนินการ</h3>

                            {/* --- 1. การสอบหัวข้อและเค้าโครง --- */}
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>การสอบหัวข้อและเค้าโครง</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>สถานะการสอบ:</label><span className={getStatusClass(currentUser.proposal_status)}>{currentUser.proposal_status || '-'}</span></li>
                                    <li><label>วันที่สอบหัวข้อ:</label><span>{formatThaiDate(currentUser.proposal_submission_date)}</span></li>
                                    <li><label>วันที่อนุมัติหัวข้อ:</label><span>{formatThaiDate(currentUser.proposal_approval_date)}</span></li>
                                </ul>
                            </div>

                            {/* --- 2. การสอบวิทยานิพนธ์ขั้นสุดท้าย --- */}
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>การสอบวิทยานิพนธ์ขั้นสุดท้าย</h4>
                                <ul className={styles.statusListDetailed}>
                                      <li><label>สถานะการสอบ:</label><span className={getStatusClass(currentUser.final_defense_status)}>{currentUser.final_defense_status || '-'}</span></li>
                                      <li><label>วันที่สอบจบ:</label><span>{formatThaiDate(currentUser.final_defense_date)}</span></li>
                                      <li><label>วันที่สำเร็จการศึกษา:</label><span>{formatThaiDate(currentUser.graduation_date)}</span></li>
                                </ul>
                            </div>

                            {/* --- 3. การสอบวัดคุณสมบัติ --- */}
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>การสอบวัดคุณสมบัติ (QE)</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>ผลการสอบ:</label><span className={getStatusClass(processedData.approvedQEDoc?.status)}>{processedData.approvedQEDoc?.status || 'ยังไม่ยื่น'}</span></li>
                                    <li><label>วันที่ผ่านการสอบ:</label><span>{formatThaiDate(processedData.approvedQEDoc?.action_date)}</span></li>
                                </ul>
                            </div>

                            {/* --- 4. การสอบภาษาอังกฤษ (ปริญญาโท) --- */}
                            {currentUser.degree === 'ปริญญาโท' && (
                                <div className={styles.statusGroup}>
                                    <h4 className={styles.groupTitle}>การสอบภาษาอังกฤษ (ปริญญาโท)</h4>
                                    <ul className={styles.statusListDetailed}>
                                        <li><label>ผลคะแนนรับเข้า:</label><span>-</span></li>
                                        <li><label>ผลคะแนนจบ:</label><span>-</span></li>
                                        <li><label>วันที่ผ่านเกณฑ์:</label><span>{formatThaiDate(processedData.approvedEngMasterDoc?.action_date)}</span></li>
                                    </ul>
                                </div>
                            )}

                            {/* --- 5. การสอบภาษาอังกฤษ (ปริญญาเอก) --- */}
                            {currentUser.degree === 'ปริญญาเอก' && (
                                <div className={styles.statusGroup}>
                                    <h4 className={styles.groupTitle}>การสอบภาษาอังกฤษ (ปริญญาเอก)</h4>
                                    <ul className={styles.statusListDetailed}>
                                        <li><label>ผลคะแนนรับเข้า:</label><span>-</span></li>
                                        <li><label>ผลคะแนนจบ:</label><span>-</span></li>
                                        <li><label>วันที่ผ่านเกณฑ์:</label><span>{formatThaiDate(processedData.approvedEngPhdDoc?.action_date)}</span></li>
                                    </ul>
                                </div>
                            )}
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

            {isCropModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalBox} ${styles.cropModalBox}`}>
                        <h3>ปรับขนาดรูปโปรไฟล์</h3>
                        <div className={styles.cropperContainer}>
                            <Cropper
                                ref={cropperRef}
                                src={imageToCrop}
                                style={{ height: 400, width: '100%' }}
                                aspectRatio={1 / 1}
                                viewMode={1}
                                background={false}
                                responsive={true}
                                checkOrientation={false}
                                guides={true}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setCropModalOpen(false)} className={`${styles.btn} ${styles.btnSecondary}`}>ยกเลิก</button>
                            <button onClick={handleConfirmCrop} className={`${styles.btn} ${styles.btnPrimary}`}>ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isSignatureModalOpen && (
                <div className={styles.modalOverlay}>
                     <div className={`${styles.modalBox} ${styles.signatureModalBox}`}>
                          <h3>แก้ไขลายเซ็นดิจิทัล</h3>
                          <div className={styles.tabNav}>
                              <button className={`${styles.tabBtn} ${signatureTab === 'draw' ? styles.active : ''}`} onClick={() => setSignatureTab('draw')}>วาดลายเซ็น</button>
                              <button className={`${styles.tabBtn} ${signatureTab === 'upload' ? styles.active : ''}`} onClick={() => setSignatureTab('upload')}>อัปโหลด</button>
                          </div>
                          <div className={styles.tabContent}>
                            {signatureTab === 'draw' && (
                                <div className={styles.canvasWrapper}>
                                    <SignaturePad 
                                        ref={signaturePadRef}
                                        options={{ penColor: 'black', backgroundColor: 'rgb(255,255,255)'}}
                                        canvasProps={{ className: styles.signatureCanvas }} 
                                    />
                                </div>
                            )}
                            {signatureTab === 'upload' && (
                                <div className={styles.uploadPlaceholder}>
                                    <label htmlFor="signature-upload-input" className={styles.btn}>
                                        <FontAwesomeIcon icon={faCamera} /> เลือกไฟล์รูปภาพ
                                    </label>
                                    <input type="file" id="signature-upload-input" ref={signatureFileInputRef} accept="image/*" style={{display: 'none'}} />
                                </div>
                            )}
                          </div>
                          <div className={styles.modalActionsStacked}>
                              <div className={styles.mainActions}>
                                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setSignatureModalOpen(false)}>ยกเลิก</button>
                                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveSignature}>บันทึก</button>
                              </div>
                              <div className={styles.secondaryActions}>
                                  <button className={styles.btnText} onClick={() => {
                                      if (signatureTab === 'draw' && signaturePadRef.current) {
                                          signaturePadRef.current.clear();
                                      } else {
                                          if (signatureFileInputRef.current) signatureFileInputRef.current.value = null;
                                      }
                                  }}>ล้าง</button>
                              </div>
                          </div>
                     </div>
                </div>
            )}
        </>
    );
}

export default ProfilePage;

