import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form1Page.module.css';

function Form1Page() {
  const navigate = useNavigate();
  // --- State สำหรับข้อมูล ---
  const [studentInfo, setStudentInfo] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State สำหรับค่าในฟอร์ม ---
  const [mainAdvisor, setMainAdvisor] = useState('');
  const [coAdvisor, setCoAdvisor] = useState('');
  const [comment, setComment] = useState('');

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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadFormData();
  }, []);

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
      navigate('/student/signature'); // อาจส่งไปหน้า signature
      return;
    }

    const formPrefix = "Form1"; // กำหนดรหัสย่อของฟอร์มนี้ เช่น F1, F2, F3
    const newDocId = `${formPrefix}`;
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

    // --- บันทึกข้อมูลลง Local Storage (เหมือนเดิม) ---
    const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
    existingPendingDocs.push(submissionData);
    localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));
    
    alert("✅ ยืนยันและส่งแบบฟอร์มเรียบร้อยแล้ว!");
    navigate("/student/status"); // ส่งไปหน้า status
  };

  // --- ส่วนแสดงผล ---
  if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูลฟอร์ม...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

  const coAdvisorOptions = advisors.filter(adv => adv.advisor_id && adv.advisor_id !== mainAdvisor);

  return (
    <div className={styles.formContainer}>
      <h2>📑 แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม</h2>
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
        
        <button type="submit">📤 ยืนยันและส่งแบบฟอร์ม</button>
      </form>
    </div>
  );
}

export default Form1Page;