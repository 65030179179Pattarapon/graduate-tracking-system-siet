import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ExamSubmitPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFileAlt, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// --- Helper function สำหรับแปลงไฟล์เป็น Data URL ---
const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- Component ย่อยสำหรับแสดงข้อมูลนักศึกษา ---
const StudentInfoDisplay = ({ studentData }) => {
    if (!studentData) return null;
    return (
        <fieldset>
            <legend>📌 ข้อมูลนักศึกษา</legend>
            <div className={styles.infoGrid}>
                <div><label>ชื่อ-นามสกุล:</label><input type="text" value={studentData.fullname} disabled /></div>
                <div><label>รหัสนักศึกษา:</label><input type="text" value={studentData.student_id} disabled /></div>
                <div><label>ระดับการศึกษา:</label><input type="text" value={studentData.degree} disabled /></div>
                <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={studentData.programName} disabled /></div>
            </div>
        </fieldset>
    );
};

// --- Component ย่อยสำหรับฟอร์มยื่นผลสอบภาษาอังกฤษ ---
const EnglishTestForm = ({ studentInfo, degree, docIdToEdit }) => {
    const navigate = useNavigate();
    const [examType, setExamType] = useState('');
    const [otherExamType, setOtherExamType] = useState('');
    const [examDate, setExamDate] = useState('');
    const [scores, setScores] = useState({});
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState('');
    const [editingDoc, setEditingDoc] = useState(null);
    const isEditMode = !!editingDoc;

    useEffect(() => {
        if (docIdToEdit) {
            const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
            const docToEdit = rejectedDocs.find(doc => doc.doc_id === docIdToEdit);
            if (docToEdit) {
                setEditingDoc(docToEdit);
                const standardTypes = ['TOEFL', 'IELTS', 'CU-TEP', 'TU-GET', 'KMITL-TEP'];
                if (standardTypes.includes(docToEdit.details.exam_type)) {
                    setExamType(docToEdit.details.exam_type);
                } else {
                    setExamType('OTHER');
                    setOtherExamType(docToEdit.details.exam_type);
                }
                setExamDate(docToEdit.details.exam_date || '');
                setScores(docToEdit.details.scores || {});
                setComment(docToEdit.student_comment || '');
                // หมายเหตุ: ไฟล์ที่เคยแนบไม่สามารถ pre-populate ได้เนื่องจากข้อจำกัดด้านความปลอดภัยของเบราว์เซอร์
            }
        }
    }, [docIdToEdit]);

    const handleScoreChange = (e) => {
        const { id, value } = e.target;
        setScores(prev => ({ ...prev, [id]: value }));
    };
    
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleRemoveFile = (indexToRemove) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userEmail = localStorage.getItem("current_user");

        if (!examType || !examDate) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        if (isEditMode && files.length === 0 && (!editingDoc.files || editingDoc.files.length === 0)) {
             alert("กรุณาแนบไฟล์ผลสอบ");
             return;
        }
        if (!isEditMode && files.length === 0) {
            alert("กรุณาแนบไฟล์ผลสอบ");
            return;
        }
        
        const finalExamType = examType === 'OTHER' ? otherExamType.trim() : examType;
        
        try {
            const filePromises = files.map(fileToDataUrl);
            const fileDataUrls = await Promise.all(filePromises);

            const commonData = {
                type: "ผลสอบภาษาอังกฤษ",
                title: `ยื่นผลสอบ ${finalExamType} (${degree})`,
                student_email: userEmail,
                student_id: studentInfo.student_id,
                details: {
                    exam_type: finalExamType,
                    exam_date: examDate,
                    scores: scores,
                },
                files: files.map((f, i) => ({ type: 'หลักฐานผลสอบ', name: f.name, url: fileDataUrls[i] })),
                student_comment: comment,
                submitted_date: new Date().toISOString(),
                status: "รอตรวจ",
                admin_comment: ''
            };

            if (isEditMode) {
                const submissionData = { ...editingDoc, ...commonData };
                if (files.length > 0) {
                    submissionData.files = commonData.files;
                } else {
                    submissionData.files = editingDoc.files; // ใช้ไฟล์เดิมถ้าไม่มีการอัปโหลดใหม่
                }

                let rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
                rejectedDocs = rejectedDocs.filter(doc => doc.doc_id !== editingDoc.doc_id);
                localStorage.setItem('localStorage_rejectedDocs', JSON.stringify(rejectedDocs));

                let pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
                pendingDocs.push(submissionData);
                localStorage.setItem('localStorage_pendingDocs', JSON.stringify(pendingDocs));
                alert("✅ แก้ไขและส่งผลสอบเรียบร้อยแล้ว!");
            } else {
                const formPrefix = "FormEng";
                const newDocId = `${formPrefix}-${Date.now()}`;
                const submissionData = { ...commonData, doc_id: newDocId };

                let pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
                pendingDocs.push(submissionData);
                localStorage.setItem('localStorage_pendingDocs', JSON.stringify(pendingDocs));
                alert("✅ ยื่นผลสอบภาษาอังกฤษเรียบร้อยแล้ว!");
            }
            navigate('/student/status');
        } catch (error) {
            console.error("Error processing files:", error);
            alert("เกิดข้อผิดพลาดในการประมวลผลไฟล์");
        }
    };
    
    const renderScoreInputs = () => {
        // ... (โค้ดส่วน renderScoreInputs เหมือนเดิม)
        switch (examType) {
            case 'TOEFL':
                return (
                    <div className={styles.scoreGrid}>
                        <div><label htmlFor="toefl-reading">Reading (0-30)</label><input type="number" id="toefl-reading" min="0" max="30" value={scores['toefl-reading'] || ''} onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="toefl-listening">Listening (0-30)</label><input type="number" id="toefl-listening" min="0" max="30" value={scores['toefl-listening'] || ''} onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="toefl-speaking">Speaking (0-30)</label><input type="number" id="toefl-speaking" min="0" max="30" value={scores['toefl-speaking'] || ''} onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="toefl-writing">Writing (0-30)</label><input type="number" id="toefl-writing" min="0" max="30" value={scores['toefl-writing'] || ''} onChange={handleScoreChange} required /></div>
                    </div>
                );
            case 'IELTS':
                 return (
                    <div className={styles.scoreGrid}>
                        <div><label htmlFor="ielts-reading">Reading (0-9)</label><input type="number" id="ielts-reading" step="0.5" min="0" max="9" value={scores['ielts-reading'] || ''} onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="ielts-listening">Listening (0-9)</label><input type="number" id="ielts-listening" step="0.5" min="0" max="9" value={scores['ielts-listening'] || ''} onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="ielts-speaking">Speaking (0-9)</label><input type="number" id="ielts-speaking" step="0.5" min="0" max="9" value={scores['ielts-speaking'] || ''} onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="ielts-writing">Writing (0-9)</label><input type="number" id="ielts-writing" step="0.5" min="0" max="9" value={scores['ielts-writing'] || ''} onChange={handleScoreChange} required /></div>
                        <div className={styles.fullWidth}><label htmlFor="ielts-overall">Overall Band (0-9)</label><input type="number" id="ielts-overall" step="0.5" min="0" max="9" value={scores['ielts-overall'] || ''} onChange={handleScoreChange} required /></div>
                    </div>
                 );
            case 'OTHER':
            case 'CU-TEP':
            case 'TU-GET':
            case 'KMITL-TEP':
                return (
                    <div className={styles.formGroup}>
                        <label htmlFor="total-score">คะแนนรวม*</label>
                        <input type="number" id="total-score" placeholder="ระบุคะแนนที่ได้รับ" value={scores['total-score'] || ''} onChange={handleScoreChange} required />
                    </div>
                );
            default:
                return <p className={styles.placeholderText}>กรุณาเลือกประเภทการสอบเพื่อกรอกคะแนน</p>;
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.fadeIn}>
            {isEditMode && (
                <div className={styles.editHeader}>
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
            <StudentInfoDisplay studentData={studentInfo} />
            <fieldset>
                <legend>📝 กรอกข้อมูลผลสอบ</legend>
                <div className={styles.formGroup}>
                    <label htmlFor="exam-type">ประเภทการสอบ*</label>
                    <select id="exam-type" value={examType} onChange={(e) => setExamType(e.target.value)} required>
                        <option value="">-- เลือกประเภทการสอบ --</option>
                        <option value="TOEFL">TOEFL</option>
                        <option value="IELTS">IELTS</option>
                        <option value="CU-TEP">CU-TEP</option>
                        <option value="TU-GET">TU-GET</option>
                        <option value="KMITL-TEP">KMITL-TEP</option>
                        <option value="OTHER">อื่นๆ</option>
                    </select>
                </div>
                {examType === 'OTHER' && (
                    <div className={styles.formGroup}>
                        <label htmlFor="other-exam-type">ชื่อการสอบอื่นๆ*</label>
                        <input type="text" id="other-exam-type" value={otherExamType} onChange={(e) => setOtherExamType(e.target.value)} required placeholder="ระบุชื่อการสอบ" />
                    </div>
                )}
                <div className={styles.formGroup}>
                    <label htmlFor="exam-date">วันที่สอบ*</label>
                    <input type="date" id="exam-date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                    {renderScoreInputs()}
                </div>
            </fieldset>
            <fieldset>
                 <legend>📎 แนบไฟล์หลักฐานผลสอบ {isEditMode && "(หากไม่ต้องการเปลี่ยนไฟล์เดิม ไม่ต้องแนบใหม่)"}</legend>
                 <div className={styles.uploadArea}>
                     <label htmlFor="exam-file-input" className={styles.uploadBtn}>
                         <FontAwesomeIcon icon={faCloudUploadAlt} /> เลือกไฟล์...
                     </label>
                     <input type="file" id="exam-file-input" onChange={handleFileChange} multiple style={{display: 'none'}} accept=".pdf,.jpg,.jpeg,.png" />
                 </div>
                 <ul className={styles.fileListContainer}>
                     {files.map((file, index) => (
                         <li key={index}>
                             <a href={URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className={styles.fileInfo}>
                                 <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
                                 <span>{file.name}</span>
                             </a>
                             <button type="button" onClick={() => handleRemoveFile(index)} className={styles.deleteFileBtn}>
                                 <FontAwesomeIcon icon={faTimes} />
                             </button>
                         </li>
                     ))}
                 </ul>
            </fieldset>
            <fieldset>
                <legend>📝 ความคิดเห็นเพิ่มเติม</legend>
                <textarea rows="4" placeholder="ความคิดเห็นเพิ่มเติม..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </fieldset>
            <button type="submit" className={styles.submitButton}>
                {isEditMode ? '📤 แก้ไขและส่งผลสอบอีกครั้ง' : '📤 ยืนยันและส่งผลสอบ'}
            </button>
        </form>
    );
};


// --- Component ย่อยสำหรับฟอร์มยื่นผลสอบ QE ---
const QEForm = ({ studentInfo, docIdToEdit }) => {
    const navigate = useNavigate();
    const [qeScore, setQeScore] = useState('');
    const [qeFile, setQeFile] = useState(null);
    const [comment, setComment] = useState('');
    const [editingDoc, setEditingDoc] = useState(null);
    const isEditMode = !!editingDoc;
    
    useEffect(() => {
        if (docIdToEdit) {
            const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
            const docToEdit = rejectedDocs.find(doc => doc.doc_id === docIdToEdit);
            if (docToEdit) {
                setEditingDoc(docToEdit);
                setQeScore(docToEdit.details.result || '');
                setComment(docToEdit.student_comment || '');
            }
        }
    }, [docIdToEdit]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) setQeFile(e.target.files[0]);
    };
    
    const handleRemoveFile = () => {
        setQeFile(null);
        document.getElementById('qe-file-input').value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userEmail = localStorage.getItem("current_user");

        if (!qeScore) {
            alert("กรุณาเลือกผลการสอบ");
            return;
        }
        if (isEditMode && !qeFile && (!editingDoc.files || editingDoc.files.length === 0)) {
            alert("กรุณาแนบไฟล์หลักฐาน");
            return;
        }
        if (!isEditMode && !qeFile) {
            alert("กรุณาแนบไฟล์หลักฐาน");
            return;
        }

        try {
            const fileDataUrl = await fileToDataUrl(qeFile);

            const commonData = {
                type: "ผลสอบวัดคุณสมบัติ",
                title: "ยื่นผลสอบวัดคุณสมบัติ (QE)",
                student_email: userEmail,
                student_id: studentInfo.student_id,
                details: { result: qeScore },
                student_comment: comment,
                submitted_date: new Date().toISOString(),
                status: "รอตรวจ",
                admin_comment: ''
            };

            if (isEditMode) {
                const submissionData = { ...editingDoc, ...commonData };
                if (qeFile) {
                    submissionData.files = [{ type: 'หลักฐานผลสอบ', name: qeFile.name, url: fileDataUrl }];
                } else {
                    submissionData.files = editingDoc.files; // ใช้ไฟล์เดิม
                }
                
                let rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
                rejectedDocs = rejectedDocs.filter(doc => doc.doc_id !== editingDoc.doc_id);
                localStorage.setItem('localStorage_rejectedDocs', JSON.stringify(rejectedDocs));

                let pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
                pendingDocs.push(submissionData);
                localStorage.setItem('localStorage_pendingDocs', JSON.stringify(pendingDocs));
                alert('แก้ไขผลสอบวัดคุณสมบัติ (QE) สำเร็จ!');
            } else {
                const formPrefix = "FormQE";
                const newDocId = `${formPrefix}-${Date.now()}`;
                const submissionData = { 
                    ...commonData, 
                    doc_id: newDocId,
                    files: [{ type: 'หลักฐานผลสอบ', name: qeFile.name, url: fileDataUrl }]
                };

                let pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
                pendingDocs.push(submissionData);
                localStorage.setItem('localStorage_pendingDocs', JSON.stringify(pendingDocs));
                alert('ส่งผลสอบวัดคุณสมบัติ (QE) สำเร็จ!');
            }
            navigate('/student/status');
        } catch (error) {
            console.error("Error processing file:", error);
            alert("เกิดข้อผิดพลาดในการประมวลผลไฟล์");
        }
    };
    
    return (
            <form onSubmit={handleSubmit} className={styles.fadeIn}>
                {isEditMode && (
                    // 👇 ให้ใช้ className นี้
                    <div className={styles.editHeader}> 
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
            <StudentInfoDisplay studentData={studentInfo} />
            <fieldset>
                <legend>📝 กรอกข้อมูลผลสอบวัดคุณสมบัติ (QE)</legend>
                <div className={styles.formGroup}>
                    <label htmlFor="qe-score">ผลการสอบ*</label>
                    <select id="qe-score" value={qeScore} onChange={(e) => setQeScore(e.target.value)} required>
                        <option value="">-- เลือกผลการสอบ --</option>
                        <option value="ผ่าน">ผ่าน</option>
                        <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                    </select>
                </div>
            </fieldset>
            <fieldset>
                <legend>📎 แนบไฟล์หลักฐานผลสอบ {isEditMode && "(หากไม่ต้องการเปลี่ยนไฟล์เดิม ไม่ต้องแนบใหม่)"}</legend>
                 <div className={styles.uploadArea}>
                     <label htmlFor="qe-file-input" className={styles.uploadBtn}>
                         <FontAwesomeIcon icon={faCloudUploadAlt} /> เลือกไฟล์...
                     </label>
                     <input type="file" id="qe-file-input" onChange={handleFileChange} style={{display: 'none'}} accept=".pdf,.jpg,.jpeg,.png" />
                 </div>
                 <ul className={styles.fileListContainer}>
                     {qeFile && (
                         <li>
                             <a href={URL.createObjectURL(qeFile)} target="_blank" rel="noopener noreferrer" className={styles.fileInfo}>
                                 <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
                                 <span>{qeFile.name}</span>
                             </a>
                             <button type="button" onClick={handleRemoveFile} className={styles.deleteFileBtn}>
                                 <FontAwesomeIcon icon={faTimes} />
                             </button>
                         </li>
                     )}
                 </ul>
            </fieldset>
            <fieldset>
                <legend>📝 ความคิดเห็นเพิ่มเติม</legend>
                <textarea rows="4" placeholder="ความคิดเห็นเพิ่มเติม..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </fieldset>
            <button type="submit" className={styles.submitButton}>
                {isEditMode ? '📤 แก้ไขและส่งผลสอบอีกครั้ง' : '📤 ยืนยันและส่งผลสอบ'}
            </button>
        </form>
    );
};

// --- Component หลักของหน้า ---
function ExamSubmitPage() {
    const [submissionType, setSubmissionType] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [docIdToEdit, setDocIdToEdit] = useState(null); // ✅ State สำหรับเก็บ ID ที่จะแก้ไข
    const location = useLocation();
    const isEditMode = !!docIdToEdit;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // --- โหลดข้อมูลนักศึกษา (เหมือนเดิม) ---
                const userEmail = localStorage.getItem("current_user");
                if (!userEmail) return;

                const studentsRes = await fetch("/data/student.json");
                const students = await studentsRes.json();
                const currentUser = students.find(s => s.email === userEmail);

                if (currentUser) {
                    const programsRes = await fetch("/data/structures/programs.json");
                    const programs = await programsRes.json();
                    const programName = programs.find(p => p.id === currentUser.program_id)?.name || 'N/A';
                    setStudentInfo({
                        fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim(),
                        student_id: currentUser.student_id,
                        degree: currentUser.degree,
                        programName: programName,
                    });
                }

                // ✅ ตรวจสอบ URL สำหรับโหมดแก้ไข
                const queryParams = new URLSearchParams(location.search);
                const editId = queryParams.get('edit');
                if (editId) {
                    setDocIdToEdit(editId);
                    const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
                    const docToEdit = rejectedDocs.find(doc => doc.doc_id === editId);
                    
                    if (docToEdit) {
                        // ✅ ตั้งค่า dropdown ให้ตรงกับประเภทของเอกสารที่แก้ไข
                        if (docToEdit.type === 'ผลสอบวัดคุณสมบัติ') {
                            setSubmissionType('qe');
                        } else if (docToEdit.type === 'ผลสอบภาษาอังกฤษ') {
                            if (docToEdit.title.includes('ปริญญาโท')) {
                                setSubmissionType('eng_master');
                            } else if (docToEdit.title.includes('ปริญญาเอก')) {
                                setSubmissionType('eng_phd');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load student data", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [location.search]);

    const renderForm = () => {
        if (loading) return <div>กำลังโหลดข้อมูลนักศึกษา...</div>;
        if (!studentInfo) return <div>ไม่พบข้อมูลนักศึกษา</div>;

        switch (submissionType) {
            case 'eng_master':
                return <EnglishTestForm studentInfo={studentInfo} degree="ปริญญาโท" docIdToEdit={docIdToEdit} />;
            case 'eng_phd':
                return <EnglishTestForm studentInfo={studentInfo} degree="ปริญญาเอก" docIdToEdit={docIdToEdit} />;
            case 'qe':
                return <QEForm studentInfo={studentInfo} docIdToEdit={docIdToEdit} />;
            default:
                return <div className={styles.formPlaceholder}>กรุณาเลือกประเภทการยื่นผลสอบ</div>;
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>{isEditMode ? '📝 แก้ไขการยื่นยื่นผลสอบวัดผลภาษาอังกฤษ และผลสอบวัดคุณสมบัติ' : '📑 ยื่นผลสอบวัดผลภาษาอังกฤษ และผลสอบวัดคุณสมบัติ'}</h2>
            
            <div className={styles.selectionGroup}>
                <label htmlFor="submissionType">กรุณาเลือกประเภทการยื่นผลสอบ*</label>
                <select 
                    id="submissionType" 
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    required
                    disabled={isEditMode} // ✅ ปิดการใช้งาน dropdown ในโหมดแก้ไข
                >
                    <option value="">-- เลือกประเภท --</option>
                    <option value="eng_master">ยื่นผลสอบภาษาอังกฤษ (ปริญญาโท)</option>
                    <option value="eng_phd">ยื่นผลสอบภาษาอังกฤษ (ปริญญาเอก)</option>
                    <option value="qe">ยื่นผลสอบวัดคุณสมบัติ (QE)</option>
                </select>
            </div>

            <div className={styles.dynamicFormContainer}>
                {renderForm()}
            </div>
        </div>
    );
}

export default ExamSubmitPage;