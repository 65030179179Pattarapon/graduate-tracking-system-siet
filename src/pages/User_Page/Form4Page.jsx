import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form4Page.module.css';

function Form4Page() {
  const navigate = useNavigate();

  const [displayData, setDisplayData] = useState(null);
  const [formData, setFormData] = useState({
    documentTypes: {},
    evaluators: [],
    comment: '',
  });
  const [numEvaluators, setNumEvaluators] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
        try {
            const userEmail = localStorage.getItem("current_user");
            if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

            const studentsRes = await fetch("/data/student.json");
            const students = await studentsRes.json();
            const currentUser = students.find(s => s.email === userEmail);
            if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");

            const baseDocs = currentUser.documents || [];
            const newPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]').filter(doc => doc.student_email === userEmail);
            const allUserDocuments = [...baseDocs, ...newPendingDocs];
            const approvedForm2 = allUserDocuments.find(doc => doc.type === 'ฟอร์ม 2' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'อนุมัติ'));

            const programsRes = await fetch("/data/structures/programs.json");
            const programs = await programsRes.json();
            const departmentsRes = await fetch("/data/structures/departments.json");
            const departments = await departmentsRes.json();

            const programName = programs.find(p => p.id === currentUser.program_id)?.name || 'N/A';
            const departmentName = departments.find(d => d.id === currentUser.department_id)?.name || 'N/A';

            setDisplayData({
                fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim(),
                student_id: currentUser.student_id,
                degree: currentUser.degree,
                programName: programName,
                departmentName: departmentName,
                proposal_approval_date: approvedForm2?.action_date,
                thesis_title_th: approvedForm2?.thesis_title_th || "ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)",
                thesis_title_en: approvedForm2?.thesis_title_en || "ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)",
            });
            
            // ใช้ useEffect แยกเพื่อตั้งค่า evaluators เริ่มต้น
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    loadInitialData();
  }, []);

  // useEffect สำหรับตั้งค่า evaluators เริ่มต้น หรือเมื่อ numEvaluators เปลี่ยน
  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        evaluators: Array.from({ length: numEvaluators }, () => ({
            prefix: '', firstName: '', lastName: '', affiliation: '', phone: '', email: ''
        }))
    }));
  }, [numEvaluators]);


  const handleNumEvaluatorsChange = (e) => {
    let count = parseInt(e.target.value, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 10) count = 10;
    setNumEvaluators(count);
  };

  const handleEvaluatorChange = (index, field, value) => {
    const newEvaluators = [...formData.evaluators];
    newEvaluators[index][field] = value;
    setFormData(prev => ({ ...prev, evaluators: newEvaluators }));
  };
  
  const handleCheckboxChange = (e) => {
      const { value, checked } = e.target;
      const newDocTypes = { ...formData.documentTypes };

      if (checked) {
          newDocTypes[value] = { checked: true, quantity: 1, otherText: '' };
      } else {
          delete newDocTypes[value];
      }
      setFormData(prev => ({ ...prev, documentTypes: newDocTypes }));
  };

  const handleQuantityChange = (type, quantity) => {
    const numQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    const newDocTypes = { ...formData.documentTypes };
    if (newDocTypes[type]) {
      newDocTypes[type].quantity = numQuantity;
      setFormData(prev => ({ ...prev, documentTypes: newDocTypes }));
    }
  };
  
  const handleOtherTextChange = (text) => {
      const newDocTypes = { ...formData.documentTypes };
      if (newDocTypes['อื่นๆ']) {
          newDocTypes['อื่นๆ'].otherText = text;
          setFormData(prev => ({ ...prev, documentTypes: newDocTypes }));
      }
  };

  const handleCommentChange = (e) => {
      setFormData(prev => ({...prev, comment: e.target.value}));
  };

  // --- ✅ นี่คือ handleSubmit ฉบับสมบูรณ์ ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("current_user");

    // --- Validation ---
    const documentTypesData = Object.entries(formData.documentTypes).map(([type, data]) => {
        if (type === 'อื่นๆ' && !data.otherText.trim()) return null; // ไม่นับ "อื่นๆ" ที่ว่างเปล่า
        return { type: (type === 'อื่นๆ' ? `อื่นๆ: ${data.otherText.trim()}` : type), quantity: data.quantity };
    }).filter(Boolean);

    if (documentTypesData.length === 0) {
        alert("กรุณาเลือกประเภทของเครื่องมือที่ต้องการประเมินอย่างน้อย 1 รายการ");
        return;
    }
    
    for (let i = 0; i < formData.evaluators.length; i++) {
        const ev = formData.evaluators[i];
        if (!ev.prefix || !ev.firstName || !ev.lastName || !ev.affiliation || !ev.phone || !ev.email) {
            alert(`กรุณากรอกข้อมูลผู้ทรงคุณวุฒิคนที่ ${i + 1} ให้ครบถ้วน`);
            return;
        }
    }

    // --- Construct Submission Object ---
    const submissionData = {
        doc_id: `form4_${userEmail}_${Date.now()}`,
        type: "ฟอร์ม 4",
        title: "แบบขอหนังสือเชิญเป็นผู้ทรงคุณวุฒิตรวจและประเมิน...เพื่อการวิจัย",
        student_email: userEmail,
        student_id: displayData.student_id,
        details: {
            document_types: documentTypesData,
            evaluators: formData.evaluators
        },
        student_comment: formData.comment,
        submitted_date: new Date().toISOString(),
        status: "รอตรวจ"
    };

    // --- Save to localStorage ---
    const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
    existingPendingDocs.push(submissionData);
    localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));

    alert("✅ ยืนยันและส่งแบบฟอร์มเรียบร้อยแล้ว!");
    navigate("/student/status");
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className={styles.formContainer}>
      <h2>📑 แบบขอหนังสือเชิญเป็นผู้ทรงคุณวุฒิตรวจและประเมิน...เพื่อการวิจัย</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>📌 ข้อมูลนักศึกษา</legend>
            <div className={`${styles.infoGrid} ${styles.threeCols}`}>
                <div><label>ชื่อ-นามสกุล:</label><input type="text" value={displayData?.fullname || ''} disabled /></div>
                <div><label>รหัสนักศึกษา:</label><input type="text" value={displayData?.student_id || ''} disabled /></div>
                <div><label>ระดับปริญญา:</label><input type="text" value={displayData?.degree || ''} disabled /></div>
            </div>
            <div className={styles.infoGrid}>
                <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={displayData?.programName || ''} disabled /></div>
                <div><label>ภาควิชา:</label><input type="text" value={displayData?.departmentName || ''} disabled /></div>
            </div>
        </fieldset>

        <fieldset>
          <legend>📖 ข้อมูลวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</legend>
            <div className={styles.formGroup}>
                <label>วันที่เสนอเค้าโครงฯ ได้รับอนุมัติ:</label>
                <input type="text" value={displayData?.proposal_approval_date ? new Date(displayData.proposal_approval_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} disabled />
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
          <legend>👨‍🏫 รายละเอียดการขอเชิญ</legend>
          <div className={styles.formGroup}>
            <label>ประเภทของเครื่องมือที่ต้องการประเมิน* (เลือกและระบุจำนวน)</label>
            <div className={styles.checkboxGroup}>
                {['บทเรียน', 'แบบประเมิน', 'แบบทดสอบ', 'แบบสอบถาม'].map(type => (
                    <div className={styles.checkboxItem} key={type}>
                        <label>
                            <input type="checkbox" name="document-type" value={type}
                                checked={!!formData.documentTypes[type]?.checked}
                                onChange={handleCheckboxChange} /> {type}
                        </label>
                        <div className={styles.quantityWrapper}>
                            <input 
                                type="number" 
                                className={styles.quantityInput}
                                min="1" 
                                value={formData.documentTypes[type]?.quantity || 1}
                                disabled={!formData.documentTypes[type]?.checked}
                                onChange={(e) => handleQuantityChange(type, e.target.value)}
                            />
                            <span>ฉบับ</span>
                        </div>
                    </div>
                ))}
                <div className={`${styles.checkboxItem} ${styles.otherItem}`}>
                    <label>
                        <input type="checkbox" name="document-type" value="อื่นๆ"
                           checked={!!formData.documentTypes['อื่นๆ']?.checked}
                           onChange={handleCheckboxChange} /> อื่นๆ:
                    </label>
                    <input 
                        type="text"
                        placeholder="ระบุเพิ่มเติม"
                        disabled={!formData.documentTypes['อื่นๆ']?.checked}
                        value={formData.documentTypes['อื่นๆ']?.otherText || ''}
                        onChange={(e) => handleOtherTextChange(e.target.value)}
                    />
                    <div className={styles.quantityWrapper}>
                        <input 
                            type="number" 
                            className={styles.quantityInput}
                            min="1" 
                            value={formData.documentTypes['อื่นๆ']?.quantity || 1}
                            disabled={!formData.documentTypes['อื่นๆ']?.checked}
                            onChange={(e) => handleQuantityChange('อื่นๆ', e.target.value)}
                        />
                        <span>ฉบับ</span>
                    </div>
                </div>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="num-evaluators">จำนวนผู้ทรงคุณวุฒิที่ต้องการเชิญ (1-10 คน)*</label>
            <input type="number" id="num-evaluators" value={numEvaluators} onChange={handleNumEvaluatorsChange} min="1" max="10" placeholder="ระบุจำนวน" required />
          </div>
          <div id="evaluators-container">
            {formData.evaluators.map((evaluator, index) => (
              <div key={index} className={styles.evaluatorCard}>
                <h4>ข้อมูลผู้ทรงคุณวุฒิ คนที่ {index + 1}</h4>
                <div className={styles.formGroup}>
                  <label>คำนำหน้า/ยศ/ตำแหน่ง*</label>
                  <input type="text" value={evaluator.prefix} onChange={(e) => handleEvaluatorChange(index, 'prefix', e.target.value)} required />
                </div>
                <div className={styles.infoGrid}>
                    <div>
                        <label>ชื่อ*</label>
                        <input type="text" value={evaluator.firstName} onChange={(e) => handleEvaluatorChange(index, 'firstName', e.target.value)} required />
                    </div>
                    <div>
                        <label>นามสกุล*</label>
                        <input type="text" value={evaluator.lastName} onChange={(e) => handleEvaluatorChange(index, 'lastName', e.target.value)} required />
                    </div>
                </div>
                 <div className={styles.formGroup}>
                  <label>สถาบัน/หน่วยงาน*</label>
                  <input type="text" value={evaluator.affiliation} onChange={(e) => handleEvaluatorChange(index, 'affiliation', e.target.value)} required />
                </div>
                <div className={styles.infoGrid}>
                    <div>
                        <label>เบอร์โทรศัพท์*</label>
                        <input type="tel" value={evaluator.phone} onChange={(e) => handleEvaluatorChange(index, 'phone', e.target.value)} required />
                    </div>
                    <div>
                        <label>อีเมล*</label>
                        <input type="email" value={evaluator.email} onChange={(e) => handleEvaluatorChange(index, 'email', e.target.value)} required />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>📝 ความคิดเห็นเพิ่มเติม (ถ้ามี)</legend>
          <div className={styles.formGroup}>
              <label htmlFor="student-comment">คุณสามารถใส่คำแนะนำหรือข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ได้ที่นี่</label>
              <textarea id="student-comment" name="comment" rows="4" maxLength="250" placeholder="ความคิดเห็นเพิ่มเติม..." value={formData.comment} onChange={handleCommentChange}></textarea>
              <div className={styles.charCounter}>{formData.comment.length} / 250</div>
          </div>
        </fieldset>
        <button type="submit">📤 ยืนยันและส่งแบบฟอร์ม</button>
      </form>
    </div>
  );
}

export default Form4Page;