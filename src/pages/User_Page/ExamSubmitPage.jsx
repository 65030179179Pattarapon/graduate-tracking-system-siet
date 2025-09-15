import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExamSubmitPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFileAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

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
const EnglishTestForm = ({ studentInfo, degree }) => {
    const navigate = useNavigate();
    const [examType, setExamType] = useState('');
    const [otherExamType, setOtherExamType] = useState('');
    const [examDate, setExamDate] = useState('');
    const [scores, setScores] = useState({});
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState('');

    const handleScoreChange = (e) => {
        const { id, value } = e.target;
        setScores(prev => ({ ...prev, [id]: value }));
    };
    
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        // สามารถเพิ่มการตรวจสอบขนาดไฟล์หรือชนิดไฟล์ที่นี่
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (indexToRemove) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

const handleSubmit = (e) => {
        e.preventDefault();
        const userEmail = localStorage.getItem("current_user");

        if (!examType || !examDate || files.length === 0) {
            alert("กรุณากรอกข้อมูลและแนบไฟล์ผลสอบให้ครบถ้วน");
            return;
        }
        if (examType === 'OTHER' && !otherExamType.trim()) {
            alert("กรุณาระบุชื่อการสอบอื่นๆ");
            return;
        }

        const finalExamType = examType === 'OTHER' ? otherExamType.trim() : examType;

        const formPrefix = "FormEng"; // กำหนดรหัสย่อของฟอร์มนี้ เช่น F1, F2, F3
        const newDocId = `${formPrefix}`;
        const submissionData = {
            doc_id: newDocId,
            type: "ผลสอบภาษาอังกฤษ",
            title: `ยื่นผลสอบ ${finalExamType} (${degree})`,
            student_email: userEmail,
            student_id: studentInfo.student_id,
            details: {
                exam_type: finalExamType,
                exam_date: examDate,
                scores: scores,
            },
            files: files.map(f => ({ type: 'หลักฐานผลสอบ', name: f.name })),
            student_comment: comment,
            submitted_date: new Date().toISOString(),
            status: "รอตรวจ"
        };
        
        const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
        existingPendingDocs.push(submissionData);
        localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));

        alert("✅ ยื่นผลสอบภาษาอังกฤษเรียบร้อยแล้ว!");
        navigate('/student/status');
    };
    
    const renderScoreInputs = () => {
        switch (examType) {
            case 'TOEFL':
                return (
                    <div className={styles.scoreGrid}>
                        <div><label htmlFor="toefl-reading">Reading (0-30)</label><input type="number" id="toefl-reading" min="0" max="30" onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="toefl-listening">Listening (0-30)</label><input type="number" id="toefl-listening" min="0" max="30" onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="toefl-speaking">Speaking (0-30)</label><input type="number" id="toefl-speaking" min="0" max="30" onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="toefl-writing">Writing (0-30)</label><input type="number" id="toefl-writing" min="0" max="30" onChange={handleScoreChange} required /></div>
                    </div>
                );
            case 'IELTS':
                 return (
                    <div className={styles.scoreGrid}>
                        <div><label htmlFor="ielts-reading">Reading (0-9)</label><input type="number" id="ielts-reading" step="0.5" min="0" max="9" onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="ielts-listening">Listening (0-9)</label><input type="number" id="ielts-listening" step="0.5" min="0" max="9" onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="ielts-speaking">Speaking (0-9)</label><input type="number" id="ielts-speaking" step="0.5" min="0" max="9" onChange={handleScoreChange} required /></div>
                        <div><label htmlFor="ielts-writing">Writing (0-9)</label><input type="number" id="ielts-writing" step="0.5" min="0" max="9" onChange={handleScoreChange} required /></div>
                        <div className={styles.fullWidth}><label htmlFor="ielts-overall">Overall Band (0-9)</label><input type="number" id="ielts-overall" step="0.5" min="0" max="9" onChange={handleScoreChange} required /></div>
                    </div>
                 );
            case 'OTHER':
            case 'CU-TEP':
            case 'TU-GET':
            case 'KMITL-TEP':
                return (
                    <div className={styles.formGroup}>
                        <label htmlFor="total-score">คะแนนรวม*</label>
                        <input type="number" id="total-score" placeholder="ระบุคะแนนที่ได้รับ" onChange={handleScoreChange} required />
                    </div>
                );
            default:
                return <p className={styles.placeholderText}>กรุณาเลือกประเภทการสอบเพื่อกรอกคะแนน</p>;
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.fadeIn}>
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
                <legend>📎 แนบไฟล์หลักฐานผลสอบ</legend>
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
            <button type="submit" className={styles.submitButton}>📤 ยืนยันและส่งผลสอบ</button>
        </form>
    );
};


// --- Component ย่อยสำหรับฟอร์มยื่นผลสอบ QE ---
const QEForm = ({ studentInfo }) => {
    const navigate = useNavigate();
    const [qeScore, setQeScore] = useState('');
    const [qeFile, setQeFile] = useState(null);
    const [comment, setComment] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setQeFile(e.target.files[0]);
        }
    };
    
    const handleRemoveFile = () => {
        setQeFile(null);
        document.getElementById('qe-file-input').value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const userEmail = localStorage.getItem("current_user");

        if (!qeScore || !qeFile) {
            alert("กรุณาเลือกผลการสอบและแนบไฟล์หลักฐาน");
            return;
        }

        const formPrefix = "FormQE"; // กำหนดรหัสย่อของฟอร์มนี้ เช่น F1, F2, F3
        const newDocId = `${formPrefix}`;
        const submissionData = {
            doc_id: newDocId,
            type: "ผลสอบวัดคุณสมบัติ",
            title: "ยื่นผลสอบวัดคุณสมบัติ (QE)",
            student_email: userEmail,
            student_id: studentInfo.student_id,
            details: {
                result: qeScore,
            },
            files: [{ type: 'หลักฐานผลสอบ', name: qeFile.name }],
            student_comment: comment,
            submitted_date: new Date().toISOString(),
            status: "รอตรวจ"
        };

        const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
        existingPendingDocs.push(submissionData);
        localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));

        alert('ส่งผลสอบวัดคุณสมบัติ (QE) สำเร็จ!');
        navigate('/student/status');
    };
    
    return (
        <form onSubmit={handleSubmit} className={styles.fadeIn}>
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
                <legend>📎 แนบไฟล์หลักฐานผลสอบ</legend>
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
            <button type="submit" className={styles.submitButton}>📤 ยืนยันและส่งผลสอบ</button>
        </form>
    );
};

// --- Component หลักของหน้า ---
function ExamSubmitPage() {
  const [submissionType, setSubmissionType] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentInfo = async () => {
      try {
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
      } catch (error) {
        console.error("Failed to load student data", error);
      } finally {
        setLoading(false);
      }
    };
    loadStudentInfo();
  }, []);

  const renderForm = () => {
    if (loading) return <div>กำลังโหลดข้อมูลนักศึกษา...</div>;
    if (!studentInfo) return <div>ไม่พบข้อมูลนักศึกษา</div>;

    switch (submissionType) {
      case 'eng_master':
        return <EnglishTestForm studentInfo={studentInfo} degree="ปริญญาโท" />;
      case 'eng_phd':
        return <EnglishTestForm studentInfo={studentInfo} degree="ปริญญาเอก" />;
      case 'qe':
        return <QEForm studentInfo={studentInfo} />;
      default:
        return <div className={styles.formPlaceholder}>กรุณาเลือกประเภทการยื่นผลสอบ</div>;
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2><i className="fas fa-file-import"></i> ยื่นผลสอบวัดผลภาษาอังกฤษ ป.โท/ป.เอก และยื่นผลสอบวัดคุณสมบัติ</h2>
      
      <div className={styles.selectionGroup}>
        <label htmlFor="submissionType">กรุณาเลือกประเภทการยื่นผลสอบ*</label>
        <select 
          id="submissionType" 
          value={submissionType}
          onChange={(e) => setSubmissionType(e.target.value)}
          required
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