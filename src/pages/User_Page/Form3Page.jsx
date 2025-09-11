import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form3Page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

function Form3Page() {
  const navigate = useNavigate();

  const [displayData, setDisplayData] = useState(null);
  // ไม่ต้องใช้ programChairs แล้ว
  // const [programChairs, setProgramChairs] = useState([]);
  
  const [formData, setFormData] = useState({
    // programChair ไม่ต้องมีในนี้แล้ว เพราะเราจะดึงมาแสดงผลอย่างเดียว
    outlineFile: null,
    comment: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const [students, allAdvisors, programs, departments] = await Promise.all([
          fetch("/data/student.json").then(res => res.json()),
          fetch("/data/advisor.json").then(res => res.json()),
          fetch("/data/structures/programs.json").then(res => res.json()),
          fetch("/data/structures/departments.json").then(res => res.json()),
        ]);

        const currentUser = students.find(s => s.email === userEmail);
        if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");

        const baseDocs = currentUser.documents || [];
        const newPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]').filter(doc => doc.student_email === userEmail);
        const allUserDocuments = [...baseDocs, ...newPendingDocs];

        const approvedForm2 = allUserDocuments.find(doc => doc.type === 'ฟอร์ม 2' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'อนุมัติ'));
        
        const placeholder = "ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)";
        
        const findAdvisorName = (id) => {
            if (!id) return placeholder;
            const advisor = allAdvisors.find(a => a.advisor_id === id);
            return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่มีข้อมูล';
        };

        // --- ✅ ส่วนที่แก้ไข: ดึงข้อมูลประธานกรรมการสอบจากฟอร์ม 2 ---
        const programChairId = approvedForm2?.committee?.chair_id;
        const programChairName = findAdvisorName(programChairId);

        setDisplayData({
          fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim(),
          student_id: currentUser.student_id,
          degree: currentUser.degree,
          programName: programs.find(p => p.id === currentUser.program_id)?.name || '',
          departmentName: departments.find(d => d.id === currentUser.department_id)?.name || '',
          proposal_approval_date: approvedForm2?.action_date,
          thesis_title_th: approvedForm2?.thesis_title_th || placeholder,
          thesis_title_en: approvedForm2?.thesis_title_en || placeholder,
          mainAdvisorName: findAdvisorName(currentUser.main_advisor_id),
          coAdvisor1Name: findAdvisorName(currentUser.co_advisor1_id),
          coAdvisor2Name: findAdvisorName(approvedForm2?.committee?.co_advisor2_id),
          programChairId: programChairId, // เก็บ ID ไว้เพื่อใช้ตอน Submit
          programChairName: programChairName, // เก็บชื่อไว้เพื่อแสดงผล
        });
        // --- จบส่วนที่แก้ไข ---

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadFormData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };
  
  const handleRemoveFile = (fileName) => {
    setFormData(prev => ({ ...prev, [fileName]: null }));
    document.getElementById(fileName).value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("current_user");

    // --- ✅ ส่วนที่แก้ไข: ตรวจสอบว่ามีข้อมูลประธานหลักสูตรหรือไม่ ---
    if (!formData.outlineFile) {
      alert("กรุณาแนบไฟล์เค้าโครงวิทยานิพนธ์");
      return;
    }
    // --- จบส่วนที่แก้ไข ---

    const submissionData = {
      doc_id: `form3_${userEmail}_${Date.now()}`,
      type: "ฟอร์ม 3",
      title: "แบบนำส่งเอกสารหัวข้อและเค้าโครงวิทยานิพนธ์ 1 เล่ม",
      student_email: userEmail,
      student_id: displayData.student_id,
      files: [{ type: 'เค้าโครงวิทยานิพนธ์ฉบับสมบูรณ์', name: formData.outlineFile.name }],
      student_comment: formData.comment,
      submitted_date: new Date().toISOString(),
      status: "รอตรวจ",
      approvers: {
        program_chair_id: displayData.programChairId, // <-- ใช้ ID ที่ดึงมา
      }
    };

    const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
    existingPendingDocs.push(submissionData);
    localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));
    
    alert("✅ ยืนยันและนำส่งเอกสารเรียบร้อยแล้ว!");
    navigate("/student/status");
  };

  if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className={styles.formContainer}>
      <h2>📑 แบบนำส่งเอกสารหัวข้อและเค้าโครงวิทยานิพนธ์ 1 เล่ม</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>📌 ข้อมูลนักศึกษา</legend>
          <div className={styles.infoGrid}>
            <div><label>ชื่อ-นามสกุล:</label><input type="text" value={displayData?.fullname || ''} disabled /></div>
            <div><label>รหัสนักศึกษา:</label><input type="text" value={displayData?.student_id || ''} disabled /></div>
            <div><label>ระดับปริญญา:</label><input type="text" value={displayData?.degree || ''} disabled /></div>
            <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={displayData?.programName || ''} disabled /></div>
            <div className={styles.fullWidth}><label>ภาควิชา:</label><input type="text" value={displayData?.departmentName || ''} disabled /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>📖 ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</legend>
          <div className={styles.formGroup}>
            <label>วันที่อนุมัติหัวข้อ:</label>
            <input 
              type="text" 
              value={displayData?.proposal_approval_date ? new Date(displayData.proposal_approval_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : "ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)"} 
              disabled 
            />
          </div>
          <div className={styles.formGroup}>
            <label>ชื่อเรื่อง (ภาษาไทย):</label>
            <textarea value={displayData?.thesis_title_th || ''} rows="2" disabled />
          </div>
          <div className={styles.formGroup}>
            <label>ชื่อเรื่อง (ภาษาอังกฤษ):</label>
            <textarea value={displayData?.thesis_title_en || ''} rows="2" disabled />
          </div>
        </fieldset>

        <fieldset>
          <legend>👨‍🏫 อาจารย์ผู้รับผิดชอบ</legend>
          {/* --- ✅ ส่วนที่แก้ไข: เปลี่ยน Dropdown เป็น Input Disabled --- */}
          <div className={styles.formGroup}>
            <label htmlFor="programChair">ประธานกรรมการสอบ (จากฟอร์ม 2)</label>
            <input 
              type="text" 
              id="programChair" 
              value={displayData?.programChairName || ''} 
              disabled 
            />
          </div>
          {/* --- จบส่วนที่แก้ไข --- */}
          <div className={`${styles.infoGrid} ${styles.threeCols}`}>
            <div><label>อาจารย์ที่ปรึกษาหลัก:</label><input type="text" value={displayData?.mainAdvisorName || ''} disabled /></div>
            <div><label>อาจารย์ที่ปรึกษาร่วม 1:</label><input type="text" value={displayData?.coAdvisor1Name || ''} disabled /></div>
            <div><label>อาจารย์ที่ปรึกษาร่วม 2:</label><input type="text" value={displayData?.coAdvisor2Name || ''} disabled /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>📎 แนบไฟล์เค้าโครงวิทยานิพนธ์</legend>
          <div className={`${styles.subSection} ${formData.outlineFile ? styles.attached : ''}`}>
            <label htmlFor="outlineFile">ไฟล์เค้าโครงวิทยานิพนธ์ฉบับสมบูรณ์*</label>
            <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F3_PROPOSAL_REVISED_DDMMYYYY.pdf</small>
            <div className={styles.fileInputWrapper}>
              <label htmlFor="outlineFile" className={styles.fileInputLabel}>
                {formData.outlineFile ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
              </label>
              <input type="file" id="outlineFile" name="outlineFile" onChange={handleFileChange} />
              {formData.outlineFile ? (
                <div className={styles.fileInfo}>
                  <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                  <a href={URL.createObjectURL(formData.outlineFile)} target="_blank" rel="noopener noreferrer" className={styles.fileNameDisplay}>
                    {formData.outlineFile.name}
                  </a>
                  <button type="button" onClick={() => handleRemoveFile('outlineFile')} className={styles.removeFileBtn}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>
              )}
            </div>
          </div>
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
              placeholder="ความคิดเห็นเพิ่มเติม... (ไม่เกิน 250 ตัวอักษร)"
              value={formData.comment}
              onChange={handleChange}
            />
            <div className={styles.charCounter}>{formData.comment.length} / 250</div>
          </div>
        </fieldset>

        <button type="submit">📤 ยืนยันและส่งแบบฟอร์ม</button>
      </form>
    </div>
  );
}

export default Form3Page;