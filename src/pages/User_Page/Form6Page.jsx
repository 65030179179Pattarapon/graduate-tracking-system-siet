import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Form6Page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Component ย่อยสำหรับจัดการ File Input (ใช้ซ้ำ)
const FileInputBox = ({ id, name, label, instruction, file, onChange, onRemove, required = true }) => {
    return (
        <div className={`${styles.subSection} ${file ? styles.attached : ''}`}>
            <label htmlFor={id} className={styles.subSectionLabel}>{label}</label>
            {instruction && <small className={styles.fileNamingInstruction}>{instruction}</small>}
            <div className={styles.fileInputWrapper}>
                <label htmlFor={id} className={styles.fileInputLabel}>
                    {file ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                </label>
                <input type="file" id={id} name={name} onChange={onChange} style={{ display: 'none' }} required={required} />
                {file ? (
                    <div className={styles.fileInfo}>
                        <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                        {/* ✅ แก้ไข: ใช้ file ที่เป็น Object จริงๆ ไม่ใช่แค่ชื่อ */}
                        <a href={typeof file === 'string' ? file : URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className={styles.fileNameDisplay}>
                            {typeof file === 'string' ? 'ไฟล์เดิม' : file.name}
                        </a>
                        <button type="button" onClick={() => onRemove(name)} className={styles.removeFileBtn}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ) : (
                    <span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>
                )}
            </div>
        </div>
    );
};

// --- Helper function สำหรับแปลงไฟล์เป็น Data URL ---
const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        // ✅ ถ้า file เป็น null (ยังไม่ได้เลือกใหม่) ให้ resolve เป็น null
        if (!file) {
            return resolve(null);
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- Component หลักของหน้าฟอร์ม 6 ---
function Form6Page() {
    const navigate = useNavigate();
    const location = useLocation();

    const [displayData, setDisplayData] = useState(null);
    const [advisorLists, setAdvisorLists] = useState({ potentialChairs: [], potentialCoAdvisors2: [], internalMembers: [], externalMembers: [] });
    const [formData, setFormData] = useState({
        committeeChair: '', coAdvisor2: '', committeeMember5: '',
        reserveExternal: '', reserveInternal: '', comment: '',
        files: {
            thesisDraftFile: null, abstractThFile: null, abstractEnFile: null,
            tocThFile: null, tocEnFile: null, publicationProofFile: null, gradeCheckProofFile: null
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [editingDoc, setEditingDoc] = useState(null);
    const isEditMode = !!editingDoc;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const userEmail = localStorage.getItem("current_user");
                if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

                // ✅ 1. เพิ่มการตรวจสอบ Response ก่อนแปลงเป็น JSON
                const fetchData = async (url) => {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`ไม่สามารถโหลดข้อมูลจาก ${url}`);
                    const text = await response.text();
                    // ป้องกัน Error หากไฟล์ JSON ว่าง
                    return text ? JSON.parse(text) : [];
                };

                const [students, allAdvisors, programs, departments] = await Promise.all([
                    fetchData("/data/student.json"),
                    fetchData("/data/advisor.json"),
                    fetchData("/data/structures/programs.json"),
                    fetchData("/data/structures/departments.json")
                ]);

                const currentUser = students.find(s => s.email === userEmail);
                if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");

                // ✅ 2. รวมการดึงข้อมูลจาก localStorage ให้ปลอดภัยขึ้น
                const getLocalStorageDocs = (key) => JSON.parse(localStorage.getItem(key) || '[]');
                const pendingDocs = getLocalStorageDocs('localStorage_pendingDocs').filter(doc => doc.student_email === userEmail);
                const approvedDocs = getLocalStorageDocs('localStorage_approvedDocs').filter(doc => doc.student_email === userEmail);
                const allUserDocuments = [...(currentUser.documents || []), ...pendingDocs, ...approvedDocs];
                
                const approvedForm2 = allUserDocuments.find(doc => doc.type === 'ฟอร์ม 2' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'อนุมัติ'));
                
                const placeholder = "ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)";
                
                const findAdvisorName = (id) => {
                    if (!id) return 'ไม่มีข้อมูล';
                    const advisor = allAdvisors.find(a => a.advisor_id === id);
                    return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่มีข้อมูล';
                };

                const programName = programs.find(p => p.id === currentUser.program_id)?.name || 'N/A';
                const departmentName = departments.find(d => d.id === currentUser.department_id)?.name || 'N/A';

                setDisplayData({
                    fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim(),
                    student_id: currentUser.student_id,
                    degree: currentUser.degree,
                    programName, departmentName,
                    admit_semester: currentUser.admit_semester,
                    admit_year: currentUser.admit_year,
                    phone: currentUser.phone,
                    address: currentUser.address ? `${currentUser.address.street}, ${currentUser.address.city}, ${currentUser.address.province} ${currentUser.address.postal_code}` : '-',
                    workplace: currentUser.workplace || '-',
                    thesis_title_th: approvedForm2?.thesis_title_th || placeholder,
                    thesis_title_en: approvedForm2?.thesis_title_en || placeholder,
                    mainAdvisorName: findAdvisorName(currentUser.main_advisor_id),
                    coAdvisor1Name: findAdvisorName(currentUser.co_advisor1_id),
                });
                
                const usedAdvisorIds = [currentUser.main_advisor_id, currentUser.co_advisor1_id].filter(Boolean);
                const internalAdvisors = allAdvisors.filter(a => a.type !== 'อาจารย์บัณฑิตพิเศษภายนอก');
                const externalAdvisors = allAdvisors.filter(a => a.type === 'อาจารย์บัณฑิตพิเศษภายนอก');

                setAdvisorLists({
                    potentialChairs: internalAdvisors.filter(a => a.roles?.includes("สอบ") && !usedAdvisorIds.includes(a.advisor_id)),
                    potentialCoAdvisors2: internalAdvisors.filter(a => a.roles?.includes("ที่ปรึกษาวิทยานิพนธ์ร่วม") && !usedAdvisorIds.includes(a.advisor_id)),
                    internalMembers: internalAdvisors.filter(a => !usedAdvisorIds.includes(a.advisor_id)),
                    externalMembers: externalAdvisors,
                });

                // ✅ 3. ปรับ Logic การตั้งค่า FormData ให้เหมือน Form2 (เรียก setFormData ครั้งเดียว)
                const queryParams = new URLSearchParams(location.search);
                const docIdToEdit = queryParams.get('edit');
                let initialFormData = {};

                if (docIdToEdit) {
                    const rejectedDocs = getLocalStorageDocs('localStorage_rejectedDocs');
                    const docToEdit = rejectedDocs.find(doc => doc.doc_id === docIdToEdit);
                    if (docToEdit) {
                        setEditingDoc(docToEdit);
                        initialFormData = {
                            committeeChair: docToEdit.committee?.chair_id || '',
                            coAdvisor2: docToEdit.committee?.co_advisor2_id || '',
                            committeeMember5: docToEdit.committee?.member5_id || '',
                            reserveExternal: docToEdit.committee?.reserve_external_id || '',
                            reserveInternal: docToEdit.committee?.reserve_internal_id || '',
                            comment: docToEdit.student_comment || '',
                            // หมายเหตุ: การแสดงไฟล์เก่าๆ ทำได้ยากถ้าไม่เก็บ URL ไว้แต่แรก
                            // ในที่นี้จะปล่อยเป็น null เพื่อให้ผู้ใช้แนบไฟล์ใหม่
                        };
                    } else {
                        throw new Error(`ไม่พบเอกสารที่ถูกตีกลับ ID: ${docIdToEdit}`);
                    }
                } else {
                    const committeeFromForm2 = approvedForm2?.committee || {};
                    initialFormData = { 
                        committeeChair: committeeFromForm2.chair_id || '',
                        coAdvisor2: committeeFromForm2.co_advisor2_id || '',
                        committeeMember5: committeeFromForm2.member5_id || '',
                        reserveExternal: committeeFromForm2.reserve_external_id || '',
                        reserveInternal: committeeFromForm2.reserve_internal_id || '',
                        comment: '',
                    };
                }
                setFormData(prev => ({ ...prev, ...initialFormData }));

            } catch (err) {
                console.error("Error loading initial data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [location.search]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, files: { ...prev.files, [name]: files[0] } }));
        }
    };

    const handleRemoveFile = (fileName) => {
        setFormData(prev => ({ ...prev, files: { ...prev.files, [fileName]: null } }));
        const inputElement = document.getElementById(fileName);
        if (inputElement) {
            inputElement.value = "";
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const requiredFileKeys = ['thesisDraftFile', 'abstractThFile', 'abstractEnFile', 'tocThFile', 'tocEnFile', 'publicationProofFile', 'gradeCheckProofFile'];
        
        // ในโหมดแก้ไข ไม่บังคับให้แนบไฟล์ใหม่ทั้งหมด
        if (!isEditMode) {
            const missingFile = requiredFileKeys.find(key => !formData.files[key]);
            if (missingFile) {
                alert("กรุณาแนบไฟล์ประกอบคำร้องขอสอบให้ครบถ้วนทุกช่อง");
                return;
            }
        }
        
        const userEmail = localStorage.getItem("current_user");

        try {
            const filePromises = requiredFileKeys.map(key => fileToDataUrl(formData.files[key]));
            const fileDataUrls = await Promise.all(filePromises);
    
            const commonData = {
                type: "ฟอร์ม 6",
                title: "บันทึกข้อความ: ขอแต่งตั้งคณะกรรมการการสอบวิทยานิพนธ์ขั้นสุดท้าย",
                student_email: userEmail,
                student_id: displayData.student_id,
                committee: {
                    chair_id: formData.committeeChair, co_advisor2_id: formData.coAdvisor2,
                    member5_id: formData.committeeMember5, reserve_external_id: formData.reserveExternal,
                    reserve_internal_id: formData.reserveInternal,
                },
                // ✅ อัปเดตไฟล์เฉพาะอันที่ถูกเลือกใหม่
                files: isEditMode
                    ? editingDoc.files.map((oldFile, index) => {
                          const key = requiredFileKeys[index];
                          if (formData.files[key]) { // ถ้ามีไฟล์ใหม่
                              return { type: oldFile.type, name: formData.files[key].name, url: fileDataUrls[index] };
                          }
                          return oldFile; // ใช้ไฟล์เดิม
                      })
                    : requiredFileKeys.map((key, index) => ({
                          type: key.replace(/([A-Z])/g, ' $1').replace('File', '').trim(),
                          name: formData.files[key].name,
                          url: fileDataUrls[index]
                      })),
                student_comment: formData.comment,
                submitted_date: new Date().toISOString(),
                status: "รอตรวจ",
                admin_comment: '' // ล้างคอมเมนต์เก่า
            };
            
            if (isEditMode) {
                const submissionData = { ...editingDoc, ...commonData };
                let rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
                rejectedDocs = rejectedDocs.filter(doc => doc.doc_id !== editingDoc.doc_id);
                localStorage.setItem('localStorage_rejectedDocs', JSON.stringify(rejectedDocs));
                
                let pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
                pendingDocs.push(submissionData);
                localStorage.setItem('localStorage_pendingDocs', JSON.stringify(pendingDocs));
                
                alert("✅ แก้ไขและส่งคำร้องขอสอบเรียบร้อยแล้ว!");
            } else {
                const formPrefix = "Form6";
                const newDocId = `${formPrefix}-${Date.now()}`;
                const submissionData = { ...commonData, doc_id: newDocId };
                let pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
                pendingDocs.push(submissionData);
                localStorage.setItem('localStorage_pendingDocs', JSON.stringify(pendingDocs));
                
                alert("✅ ยืนยันและส่งคำร้องขอสอบเรียบร้อยแล้ว!");
            }
            navigate('/student/status');

        } catch (error) {
            console.error("Error processing form:", error);
            alert("เกิดข้อผิดพลาดในการประมวลผลไฟล์");
        }
    };

    if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div className={styles.error}>⚠️ เกิดข้อผิดพลาด: {error}</div>;

    return (
        <div className={styles.formContainer}>
                <div className={styles.titleContainer}>
                    <h2>{isEditMode ? '📝 แก้ไขบันทึกข้อความ: ขอแต่งตั้งคณะกรรมการการสอบวิทยานิพนธ์ขั้นสุดท้าย' : '📑 บันทึกข้อความ: ขอแต่งตั้งคณะกรรมการการสอบวิทยานิพนธ์ขั้นสุดท้าย'}</h2>
                </div>
                {isEditMode && (
                  <div className={styles.backButtonContainer}>
                    <button type="button" className={styles.backButton} onClick={() => navigate('/student/status')}>
                        <FontAwesomeIcon icon={faArrowLeft} /> กลับไปหน้าสถานะ
                    </button>
                  </div>
                )}

            {isEditMode && editingDoc?.admin_comment && (
                <div className={styles.rejectionNotice}>
                    <strong>เหตุผลที่ส่งกลับแก้ไข:</strong>
                    <p>{editingDoc.admin_comment}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>📌 ข้อมูลผู้ยื่นคำร้อง</legend>
                    <div className={`${styles.infoGrid} ${styles.threeCols}`}>
                        <div><label>คำนำหน้า-ชื่อ-นามสกุล:</label><input type="text" value={displayData?.fullname || ''} disabled /></div>
                        <div><label>รหัสประจำตัว:</label><input type="text" value={displayData?.student_id || ''} disabled /></div>
                        <div><label>ระดับปริญญา:</label><input type="text" value={displayData?.degree || ''} disabled /></div>
                    </div>
                    <div className={`${styles.infoGrid} ${styles.twoCols}`}>
                        <div><label>หลักสูตร/สาขาวิชา:</label><input type="text" value={displayData?.programName || ''} disabled /></div>
                        <div><label>ภาควิชา:</label><input type="text" value={displayData?.departmentName || ''} disabled /></div>
                    </div>
                    <div className={`${styles.infoGrid} ${styles.threeCols}`}>
                        <div><label>เริ่มเป็นนักศึกษาตั้งแต่ภาคเรียนที่:</label><input type="text" value={displayData?.admit_semester || ''} disabled /></div>
                        <div><label>ปีการศึกษา:</label><input type="text" value={displayData?.admit_year || ''} disabled /></div>
                        <div><label>เบอร์โทร:</label><input type="text" value={displayData?.phone || ''} disabled /></div>
                    </div>
                    <div className={`${styles.infoGrid} ${styles.twoCols}`}>
                        <div><label>ที่อยู่ปัจจุบัน:</label><textarea value={displayData?.address || ''} rows="2" disabled></textarea></div>
                        <div><label>สถานที่ทำงาน:</label><input type="text" value={displayData?.workplace || ''} disabled /></div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>ชื่อวิทยานิพนธ์ (ภาษาไทย):</label>
                        <textarea value={displayData?.thesis_title_th || ''} rows="2" disabled></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>ชื่อวิทยานิพนธ์ (ภาษาอังกฤษ):</label>
                        <textarea value={displayData?.thesis_title_en || ''} rows="2" disabled></textarea>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>👨‍🏫 คณะกรรมการสอบและอาจารย์ที่ปรึกษา</legend>
                    <p className={styles.fieldsetDescription}>ข้อมูลคณะกรรมการจะถูกดึงมาจากฟอร์ม 2 ที่อนุมัติแล้วโดยอัตโนมัติ และคุณสามารถแก้ไขรายชื่อได้ (ยกเว้นอาจารย์ที่ปรึกษา)</p>
                    <div className={styles.subSection}>
                        <label className={styles.subSectionLabel}>อาจารย์ที่ปรึกษา (ข้อมูลจากระบบ)</label>
                        <div className={styles.infoGrid}>
                            <div><label>อาจารย์ที่ปรึกษาหลัก:</label><input type="text" value={displayData?.mainAdvisorName || ''} disabled /></div>
                            <div><label>อาจารย์ที่ปรึกษาร่วม 1:</label><input type="text" value={displayData?.coAdvisor1Name || ''} disabled /></div>
                        </div>
                    </div>
                    <div className={styles.subSection}>
                        <label className={styles.subSectionLabel}>คณะกรรมการสอบ (สามารถแก้ไขได้)*</label>
                        <div className={styles.formGroup}>
                            <label htmlFor="committeeChair">ประธานกรรมการสอบ*</label>
                            <select id="committeeChair" name="committeeChair" value={formData.committeeChair} onChange={handleChange} required>
                                <option value="">-- กรุณาเลือก --</option>
                                {advisorLists.potentialChairs.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="coAdvisor2">กรรมการ (ที่ปรึกษาร่วม 2)*</label>
                            <select id="coAdvisor2" name="coAdvisor2" value={formData.coAdvisor2} onChange={handleChange} required>
                                 <option value="">-- กรุณาเลือก --</option>
                                {advisorLists.potentialCoAdvisors2.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="committeeMember5">กรรมการสอบ (คนที่ 5)*</label>
                            <select id="committeeMember5" name="committeeMember5" value={formData.committeeMember5} onChange={handleChange} required>
                                 <option value="">-- กรุณาเลือก --</option>
                                {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className={styles.subSection}>
                        <label className={styles.subSectionLabel}>กรรมการสำรอง (สามารถแก้ไขได้)*</label>
                        <div className={styles.infoGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="reserveExternal">กรรมการสำรอง (จากภายนอก)*</label>
                                <select id="reserveExternal" name="reserveExternal" value={formData.reserveExternal} onChange={handleChange} required>
                                    <option value="">-- กรุณาเลือก --</option>
                                    {advisorLists.externalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="reserveInternal">กรรมการสำรอง (จากภายใน)*</label>
                                <select id="reserveInternal" name="reserveInternal" value={formData.reserveInternal} onChange={handleChange} required>
                                    <option value="">-- กรุณาเลือก --</option>
                                    {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>📎 แนบเอกสารประกอบคำร้องขอสอบ</legend>
                    <p className={styles.fieldsetDescription}>กรุณาอัปโหลดไฟล์เอกสารที่จำเป็นทั้งหมดให้ครบถ้วน {isEditMode && "(หากไม่ต้องการเปลี่ยนไฟล์เดิม ไม่ต้องแนบใหม่)"}</p>
                    
                    <FileInputBox 
                        id="thesisDraftFile" name="thesisDraftFile"
                        label="1. วิทยานิพนธ์ฉบับสมบูรณ์* (.pdf เท่านั้น)" 
                        instruction="*ตั้งชื่อไฟล์: รหัสนักศึกษา_F6_THESIS_FINAL_DDMMYYYY.pdf" 
                        file={formData.files.thesisDraftFile} onChange={handleFileChange} onRemove={handleRemoveFile} 
                        required={!isEditMode}
                    />
                    
                    <div className={styles.subSection}>
                        <label className={styles.subSectionLabel}>2. บทคัดย่อ (Abstract)*</label>
                        <div className={styles.fileGroup}>
                            <FileInputBox 
                                id="abstractThFile" name="abstractThFile"
                                label="ไฟล์ภาษาไทย (.pdf)" 
                                instruction="*ตั้งชื่อไฟล์: รหัสนักศึกษา_F6_ABSTRACT_TH_DDMMYYYY.pdf" 
                                file={formData.files.abstractThFile} onChange={handleFileChange} onRemove={handleRemoveFile} 
                                required={!isEditMode}
                            />
                            <FileInputBox 
                                id="abstractEnFile" name="abstractEnFile"
                                label="ไฟล์ภาษาอังกฤษ (.pdf)" 
                                instruction="*ตั้งชื่อไฟล์: รหัสนักศึกษา_F6_ABSTRACT_EN_DDMMYYYY.pdf" 
                                file={formData.files.abstractEnFile} onChange={handleFileChange} onRemove={handleRemoveFile} 
                                required={!isEditMode}
                            />
                        </div>
                    </div>
                     <div className={styles.subSection}>
                        <label className={styles.subSectionLabel}>3. สารบัญ, สารบัญตาราง, สารบัญภาพ*</label>
                        <div className={styles.fileGroup}>
                            <FileInputBox 
                                id="tocThFile" name="tocThFile"
                                label="ไฟล์ภาษาไทย (.pdf)" 
                                instruction="*ตั้งชื่อไฟล์: รหัสนักศึกษา_F6_TOC_TH_DDMMYYYY.pdf" 
                                file={formData.files.tocThFile} onChange={handleFileChange} onRemove={handleRemoveFile} 
                                required={!isEditMode}
                            />
                            <FileInputBox 
                                id="tocEnFile" name="tocEnFile"
                                label="ไฟล์ภาษาอังกฤษ (.pdf)" 
                                instruction="*ตั้งชื่อไฟล์: รหัสนักศึกษา_F6_TOC_EN_DDMMYYYY.pdf" 
                                file={formData.files.tocEnFile} onChange={handleFileChange} onRemove={handleRemoveFile} 
                                required={!isEditMode}
                            />
                        </div>
                    </div>

                    <FileInputBox 
                        id="publicationProofFile" name="publicationProofFile"
                        label="4. หลักฐานการตอบรับการตีพิมพ์/นำเสนอผลงาน* (.pdf, .jpg, .png)" 
                        instruction="*ตั้งชื่อไฟล์: รหัสนักศึกษา_F6_PUBLISH_PROOF_DDMMYYYY.pdf/jpg/png" 
                        file={formData.files.publicationProofFile} onChange={handleFileChange} onRemove={handleRemoveFile} 
                        required={!isEditMode}
                    />
                    <FileInputBox 
                        id="gradeCheckProofFile" name="gradeCheckProofFile"
                        label="5. หลักฐานการตรวจสอบผลการเรียน* (.pdf, .jpg, .png)" 
                        instruction="*ตั้งชื่อไฟล์: รหัสนักศึกษา_F6_GRADE_PROOF_DDMMYYYY.pdf/jpg/png" 
                        file={formData.files.gradeCheckProofFile} onChange={handleFileChange} onRemove={handleRemoveFile} 
                        required={!isEditMode}
                    />
                </fieldset>
                
                <fieldset>
                    <legend>📝 ความคิดเห็นเพิ่มเติม (ถ้ามี)</legend>
                        <div className={styles.formGroup}>
                            <label htmlFor="comment">คุณสามารถใส่คำแนะนำหรือข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ได้ที่นี่</label>
                            <textarea 
                                id="comment" 
                                name="comment" 
                                rows="4" 
                                maxLength="250" 
                                placeholder="ความคิดเห็นเพิ่มเติม..." 
                                value={formData.comment} 
                                onChange={handleChange}>
                            </textarea>
                            <div className={styles.charCounter}>{formData.comment.length} / 250</div>
                        </div>
                </fieldset>
                
                <div className={styles.submitContainer}>
                    <button type="submit">{isEditMode ? '📤 แก้ไขและส่งคำร้องอีกครั้ง' : '📤 ยืนยันและส่งคำร้องขอสอบ'}</button>
                </div>
            </form>
        </div>
    );
}

export default Form6Page;