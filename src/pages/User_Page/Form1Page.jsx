import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Form1Page.module.css';

function Form1Page() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State สำหรับข้อมูล ---
  const [studentInfo, setStudentInfo] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State สำหรับค่าในฟอร์ม ---
  const [mainAdvisor, setMainAdvisor] = useState('');
  const [coAdvisor, setCoAdvisor] = useState('');
  const [comment, setComment] = useState('');

  // --- State สำหรับโหมดแก้ไข ---
  const [editingDoc, setEditingDoc] = useState(null);
  const isEditMode = !!editingDoc;

  // --- Effect สำหรับดึงข้อมูลเมื่อเปิดหน้า ---
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const [students, advisorList, departments, programs] = await Promise.all([
          fetch("/data/student.json").then(res => res.json()),
          fetch("/data/advisor.json").then(res => res.json()),
          fetch("/data/structures/departments.json").then(res => res.json()),
          fetch("/data/structures/programs.json").then(res => res.json())
        ]);

        const currentUser = students.find(s => s.email === userEmail);
        if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");

        const departmentName = departments.find(d => d.id === currentUser.department_id)?.name || '';
        const programName = programs.find(p => p.id === currentUser.program_id)?.name || '';

        setStudentInfo({
          ...currentUser,
          fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim(),
          department: departmentName,
          program: programName,
        });
        setAdvisors(advisorList);

        // ✅ ตรวจสอบ URL parameter สำหรับโหมดแก้ไข
        const queryParams = new URLSearchParams(location.search);
        const docIdToEdit = queryParams.get('edit');

        if (docIdToEdit) {
          const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
          const docToEdit = rejectedDocs.find(doc => doc.doc_id === docIdToEdit);
          
          if (docToEdit) {
            setEditingDoc(docToEdit);
            // ✅ ดึงข้อมูลเดิมมาใส่ใน State ของฟอร์ม
            setMainAdvisor(docToEdit.selected_main_advisor_id || '');
            setCoAdvisor(docToEdit.selected_co_advisor_id || '');
            setComment(docToEdit.student_comment || '');
          } else {
            setError(`ไม่พบเอกสารที่ถูกส่งกลับแก้ไข (ID: ${docIdToEdit})`);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadFormData();
  }, [location.search]);

  // --- Logic การ Submit ฟอร์ม ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("current_user");
    
    if (!mainAdvisor) {
      alert("กรุณาเลือกอาจารย์ที่ปรึกษาหลัก");
      return;
    }
    const signatureData = localStorage.getItem(`${userEmail}_signature_data`);
    if (!signatureData) {
      alert("ไม่พบข้อมูลลายเซ็น กรุณาตั้งค่าลายเซ็นก่อน");
      navigate('/student/signature');
      return;
    }

    if (isEditMode) {
        // --- Logic สำหรับการ "แก้ไขและส่งใหม่" ---
        const submissionData = {
            ...editingDoc, // ใช้ข้อมูลเดิมเป็นฐาน
            selected_main_advisor_id: mainAdvisor,
            selected_co_advisor_id: coAdvisor || null,
            student_comment: comment,
            submitted_date: new Date().toISOString(), // อัปเดตวันที่ส่ง
            status: "รอตรวจ", // เปลี่ยนสถานะกลับเป็นรอตรวจ
            admin_comment: '', // ล้างคอมเมนต์ของแอดมินออก
        };
        
        // 1. ลบเอกสารเดิมออกจาก rejected list
        const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
        const updatedRejectedDocs = rejectedDocs.filter(doc => doc.doc_id !== editingDoc.doc_id);
        localStorage.setItem('localStorage_rejectedDocs', JSON.stringify(updatedRejectedDocs));

        // 2. เพิ่มเอกสารที่แก้ไขแล้วเข้าไปใน pending list
        const pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
        pendingDocs.push(submissionData);
        localStorage.setItem('localStorage_pendingDocs', JSON.stringify(pendingDocs));
        
        alert("✅ แก้ไขและส่งแบบฟอร์มเรียบร้อยแล้ว!");
        navigate("/student/status");

    } else {
        // --- Logic สำหรับการ "สร้างและส่งใหม่" (เหมือนเดิม) ---
        const formPrefix = "Form1";
        const timestamp = Date.now();
        const newDocId = `${formPrefix}-${timestamp}`;
        const submissionData = {
            doc_id: newDocId,
            type: "ฟอร์ม 1",
            title: "แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม",
            student_email: userEmail,
            student_id: studentInfo.student_id,
            student: studentInfo.fullname,
            selected_main_advisor_id: mainAdvisor,
            selected_co_advisor_id: coAdvisor || null,
            student_comment: comment,
            submitted_date: new Date().toISOString(),
            signature: signatureData,
            status: "รอตรวจ"
        };

        const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
        existingPendingDocs.push(submissionData);
        localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));
        
        alert("✅ ยืนยันและส่งแบบฟอร์มเรียบร้อยแล้ว!");
        navigate("/student/status");
    }
  };

  if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

  const coAdvisorOptions = advisors.filter(adv => adv.advisor_id && adv.advisor_id !== mainAdvisor);

  return (
      <div className={styles.formContainer}>
          {/* ✅✅✅ แก้ไขส่วนนี้ทั้งหมด ✅✅✅ */}
            <div className={styles.titleContainer}>
              <h2>{isEditMode ? '📝 แก้ไขแบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม' : '📑 แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม'}</h2>
            </div>
                {isEditMode && (
                  <div className={styles.backButtonContainer}>
                    <button type="button" className={styles.backButton} onClick={() => navigate('/student/status')}>
                        กลับไปหน้าสถานะ
                    </button>
                  </div>
                )}
      
      {/* ✅ แสดง Comment ของแอดมินถ้าอยู่ในโหมดแก้ไข */}
      {isEditMode && editingDoc.admin_comment && (
        <div className={styles.rejectionNotice}>
            <strong>เหตุผลที่ส่งกลับแก้ไข:</strong>
            <p>{editingDoc.admin_comment}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>📌 ข้อมูลนักศึกษา</legend>
          <div className={styles.infoGrid}>
            <div><label>ชื่อ-นามสกุล:</label><input type="text" value={studentInfo.fullname} disabled /></div>
            <div><label>รหัสนักศึกษา:</label><input type="text" value={studentInfo.student_id} disabled /></div>
            <div><label>ระดับการศึกษา:</label><input type="text" value={studentInfo.degree} disabled /></div>
            <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={studentInfo.program} disabled /></div>
            <div><label>ภาควิชา:</label><input type="text" value={studentInfo.department} disabled /></div>
            <div><label>คณะ:</label><input type="text" value={studentInfo.faculty} disabled /></div>
            <div><label>แผนการเรียน:</label><input type="text" value={studentInfo.plan} disabled /></div>
            <div><label>เบอร์โทรศัพท์:</label><input type="text" value={studentInfo.phone} disabled /></div>
            <div className={styles.fullWidth}><label>อีเมล:</label><input type="email" value={studentInfo.email} disabled /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>👨‍🏫 เลือกอาจารย์ที่ปรึกษา</legend>
          <div className={styles.formGroup}>
            <label htmlFor="main-advisor">อาจารย์ที่ปรึกษาหลัก*:</label>
            <select id="main-advisor" required value={mainAdvisor} onChange={(e) => setMainAdvisor(e.target.value)}>
              <option value="">-- กรุณาเลือกอาจารย์ที่ปรึกษาหลัก --</option>
              {advisors.map(adv => (
                adv.advisor_id && <option key={adv.advisor_id} value={adv.advisor_id}>
                  {`${adv.prefix_th || ''}${adv.first_name_th || ''} ${adv.last_name_th || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="co-advisor">อาจารย์ที่ปรึกษาร่วม (ถ้ามี):</label>
            <select id="co-advisor" value={coAdvisor} onChange={(e) => setCoAdvisor(e.target.value)}>
              <option value="">-- สามารถเลือกอาจารย์ที่ปรึกษาร่วม --</option>
              {coAdvisorOptions.map(adv => (
                <option key={adv.advisor_id} value={adv.advisor_id}>
                  {`${adv.prefix_th || ''}${adv.first_name_th || ''} ${adv.last_name_th || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>📝 ความคิดเห็นเพิ่มเติม (ถ้ามี)</legend>
          <div className={styles.formGroup}>
            <label htmlFor="student-comment">คุณสามารถใส่คำแนะนำหรือข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ได้ที่นี่</label>
            <textarea 
              id="student-comment" 
              rows="4" 
              maxLength="250" 
              placeholder="ความคิดเห็นเพิ่มเติม... (ไม่เกิน 250 ตัวอักษร)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className={styles.charCounter}>{comment.length} / 250</div>
          </div>
        </fieldset>
        
        <button type="submit">{isEditMode ? '📤 แก้ไขและส่งแบบฟอร์มอีกครั้ง' : '📤 ยืนยันและส่งแบบฟอร์ม'}</button>
      </form>
    </div>
  );
}

export default Form1Page;
