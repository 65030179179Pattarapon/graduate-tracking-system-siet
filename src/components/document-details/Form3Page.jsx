import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form3Page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

function Form3Page() {
  const navigate = useNavigate();

  // --- State สำหรับข้อมูลที่ดึงมาแสดง ---
  const [displayData, setDisplayData] = useState(null);
  const [programChairs, setProgramChairs] = useState([]);
  
  // --- State สำหรับข้อมูลที่ผู้ใช้กรอก ---
  const [formData, setFormData] = useState({
    programChair: '',
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

        // --- ค้นหาข้อมูลจากฟอร์ม 2 ที่อนุมัติแล้ว ---
        const baseDocs = currentUser.documents || [];
        const approvedForm2 = baseDocs.find(doc => doc.type === 'ฟอร์ม 2' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'อนุมัติ'));
        
        if (!approvedForm2) {
          throw new Error("คุณยังไม่มีข้อมูลหัวข้อวิทยานิพนธ์ที่ได้รับการอนุมัติ (ฟอร์ม 2)");
        }
        
        const programName = programs.find(p => p.id === currentUser.program_id)?.name || '';
        const departmentName = departments.find(d => d.id === currentUser.department_id)?.name || '';
        
        const findAdvisorName = (id) => {
            if (!id) return 'ไม่มี';
            const advisor = allAdvisors.find(a => a.advisor_id === id);
            return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่มีข้อมูล';
        };

        setDisplayData({
          fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim(),
          student_id: currentUser.student_id,
          degree: currentUser.degree,
          programName,
          departmentName,
          proposal_approval_date: approvedForm2.action_date || new Date().toISOString(),
          thesis_title_th: approvedForm2.thesis_title_th,
          thesis_title_en: approvedForm2.thesis_title_en,
          mainAdvisorName: findAdvisorName(currentUser.main_advisor_id),
          coAdvisor1Name: findAdvisorName(currentUser.co_advisor1_id),
          coAdvisor2Name: findAdvisorName(approvedForm2.committee.co_advisor2_id),
        });

        // กรองหาประธานหลักสูตร
        setProgramChairs(allAdvisors.filter(a => a.roles?.includes("ประธานหลักสูตร")));

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

    if (!formData.programChair) {
      alert("กรุณาเลือกประธานหลักสูตร");
      return;
    }
    if (!formData.outlineFile) {
      alert("กรุณาแนบไฟล์เค้าโครงวิทยานิพนธ์");
      return;
    }

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
        program_chair_id: formData.programChair,
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
            <div><label>ชื่อ-นามสกุล:</label><input type="text" value={displayData.fullname} disabled /></div>
            <div><label>รหัสนักศึกษา:</label><input type="text" value={displayData.student_id} disabled /></div>
            <div><label>ระดับปริญญา:</label><input type="text" value={displayData.degree} disabled /></div>
            <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={displayData.programName} disabled /></div>
            <div className={styles.fullWidth}><label>ภาควิชา:</label><input type="text" value={displayData.departmentName} disabled /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>📖 ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</legend>
          <div className={styles.formGroup}>
            <label>วันที่อนุมัติหัวข้อ:</label>
            <input type="text" value={new Date(displayData.proposal_approval_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} disabled />
          </div>
          <div className={styles.formGroup}>
            <label>ชื่อเรื่อง (ภาษาไทย):</label>
            <textarea value={displayData.thesis_title_th} rows="2" disabled />
          </div>
          <div className={styles.formGroup}>
            <label>ชื่อเรื่อง (ภาษาอังกฤษ):</label>
            <textarea value={displayData.thesis_title_en} rows="2" disabled />
          </div>
        </fieldset>

        <fieldset>
          <legend>👨‍🏫 อาจารย์ผู้รับผิดชอบ</legend>
          <div className={styles.formGroup}>
            <label htmlFor="programChair">ประธานหลักสูตร (สำหรับส่งเรื่องอนุมัติ)*</label>
            <select id="programChair" name="programChair" value={formData.programChair} onChange={handleChange} required>
              <option value="">-- กรุณาเลือกประธานหลักสูตร --</option>
              {programChairs.map(chair => (
                <option key={chair.advisor_id} value={chair.advisor_id}>
                  {`${chair.prefix_th}${chair.first_name_th} ${chair.last_name_th}`.trim()}
                </option>
              ))}
            </select>
          </div>
          <div className={`${styles.infoGrid} ${styles.threeCols}`}>
            <div><label>อาจารย์ที่ปรึกษาหลัก:</label><input type="text" value={displayData.mainAdvisorName} disabled /></div>
            <div><label>อาจารย์ที่ปรึกษาร่วม 1:</label><input type="text" value={displayData.coAdvisor1Name} disabled /></div>
            <div><label>อาจารย์ที่ปรึกษาร่วม 2:</label><input type="text" value={displayData.coAdvisor2Name} disabled /></div>
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
```

#### ### 2. 📄 ไฟล์ `Form3Page.module.css`

ไฟล์ CSS นี้จะคล้ายกับของฟอร์ม 2 มากครับ

**สร้างไฟล์ `src/pages/User_Page/Form3Page.module.css`**
```css
/* คัดลอกสไตล์ส่วนใหญ่มาจาก Form2Page.module.css */
.formContainer { 
  max-width: 800px; 
  margin: 40px auto; 
  padding: 30px; 
  background: white; 
  border-radius: 12px; 
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
}
.formContainer h2 { 
    text-align: center; 
    margin-top: 0;
    margin-bottom: 25px; 
    font-size: 22px; 
}
fieldset { 
    border: 1px solid #e9ecef; 
    border-radius: 8px; 
    padding: 20px; 
    margin-bottom: 20px; 
}
legend { 
    padding: 0 10px; 
    font-weight: 600; 
    color: var(--color-primary); 
}
.infoGrid { 
    display: grid; 
    gap: 15px; 
    margin-bottom: 15px; 
    grid-template-columns: 1fr 1fr;
}
.infoGrid.threeCols { 
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
}
.infoGrid .fullWidth {
    grid-column: 1 / -1;
}
.formGroup { 
    margin-bottom: 20px; 
}
.subSection { 
    background-color: #f8f9fa; 
    padding: 20px; 
    border-radius: 8px; 
    border: 1px solid #e9ecef; 
    margin-top: 15px; 
    transition: all 0.3s ease;
}
label { 
    font-size: 14px; 
    color: #555; 
    margin-bottom: 5px; 
    display: block; 
}
input, select, textarea { 
    width: 100%; 
    padding: 10px; 
    border: 1px solid #ccc; 
    border-radius: 6px; 
    box-sizing: border-box; 
    font-family: 'Sarabun', sans-serif; 
    font-size: 15px; 
}
input:disabled, textarea:disabled { 
    background-color: #e9ecef; 
    cursor: not-allowed; 
}
textarea { 
    resize: vertical; 
    min-height: 80px; 
}
.fileInputWrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}
.fileInputWrapper input[type="file"] {
  display: none;
}
.fileInputLabel {
  background-color: var(--color-primary);
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.subSection.attached {
  background-color: #e6f7ec;
  border-left: 4px solid var(--approved-color);
}
.fileInfo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-grow: 1;
  min-width: 0;
}
.checkIcon {
  color: var(--approved-color);
  font-size: 18px;
}
.fileNameDisplay { 
  font-size: 14px; 
  color: #333;
}
a.fileNameDisplay:hover {
  color: var(--color-primary);
  text-decoration: underline;
}
.removeFileBtn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
  margin-left: auto;
}
.removeFileBtn:hover {
  color: #dc3545;
}
.fileNamingInstruction {
    display: block;
    font-size: 13px;
    color: #e74c3c;
    margin-bottom: 10px;
    background-color: #fef5f5;
    padding: 8px 12px;
    border-radius: 4px;
}
.formContainer button[type="submit"] { 
    width: 100%; 
    background: var(--color-secondary); 
    color: white; 
    border: none; 
    padding: 12px; 
    border-radius: 6px; 
    font-size: 16px; 
    font-weight: 600; 
    cursor: pointer; 
}
.loading, .error { 
    text-align: center; 
    padding: 40px; 
    font-size: 18px; 
}
.error { 
    color: var(--rejected-color); 
}
.charCounter {
    text-align: right;
    font-size: 12px;
    color: #888;
    margin-top: 5px;
}
```

#### ### 3. อัปเดต Router หลัก (`App.jsx`)

```jsx
// src/App.jsx
// ... (imports) ...
import Form2Page from './pages/User_Page/Form2Page';
import Form3Page from './pages/User_Page/Form3Page'; // 1. นำเข้าหน้าฟอร์ม 3

function App() {
  return (
    <Routes>
      {/* ... (Routes เดิม) ... */}
      <Route path="/student" element={<UserLayout />}>
        {/* ... (Routes เดิม) ... */}
        <Route path="form2" element={<Form2Page />} />
        
        {/* 2. เพิ่ม Route สำหรับหน้าฟอร์ม 3 */}
        <Route path="form3" element={<Form3Page />} />

        <Route path="docs/:docId" element={<DocumentDetailPage />} />
      </Route>
    </Routes>
  );
}
export default App;
