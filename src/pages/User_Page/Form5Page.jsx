import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form5Page.module.css';

const initialToolState = {
    'แบบสอบถาม': { checked: false, quantity: 1 },
    'แบบทดสอบ': { checked: false, quantity: 1 },
    'ทดลองสอน': { checked: false, quantity: 1 },
    'อื่นๆ': { checked: false, quantity: 1, otherText: '' },
};

function Form5Page() {
  const navigate = useNavigate();

  const [displayData, setDisplayData] = useState(null);
  const [researchTools, setResearchTools] = useState(initialToolState);
  const [comment, setComment] = useState('');
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

            // --- ✅ นี่คือส่วนที่แก้ไข Logic ---
            const baseDocs = currentUser.documents || [];
            const newPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]').filter(doc => doc.student_email === userEmail);
            const allUserDocuments = [...baseDocs, ...newPendingDocs];
            
            // ค้นหาฟอร์ม 2 ที่อนุมัติแล้ว (ถ้ามี)
            const approvedForm2 = allUserDocuments.find(doc => doc.type === 'ฟอร์ม 2' && (doc.status === 'อนุมัติแล้ว' || doc.status === 'อนุมัติ'));

            // ไม่ throw error แล้ว แต่จะใช้ค่า placeholder แทน
            const placeholder = "ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)";
            
            const programsRes = await fetch("/data/structures/programs.json");
            const programs = await programsRes.json();
            
            const programName = programs.find(p => p.id === currentUser.program_id)?.name || 'N/A';

            setDisplayData({
                fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim(),
                student_id: currentUser.student_id,
                degree: currentUser.degree,
                programName: programName,
                email: currentUser.email,
                phone: currentUser.phone,
                proposal_approval_date: approvedForm2?.action_date, // ถ้าไม่มีจะเป็น undefined
                thesis_title_th: approvedForm2?.thesis_title_th || placeholder,
                thesis_title_en: approvedForm2?.thesis_title_en || placeholder,
            });
            // --- จบส่วนที่แก้ไข ---

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    loadInitialData();
  }, []);

  const handleToolChange = (e) => {
    const { value, checked } = e.target;
    setResearchTools(prev => ({
        ...prev,
        [value]: { ...prev[value], checked: checked }
    }));
  };

  const handleQuantityChange = (toolName, quantity) => {
    const numQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    setResearchTools(prev => ({
        ...prev,
        [toolName]: { ...prev[toolName], quantity: numQuantity }
    }));
  };

  const handleOtherTextChange = (e) => {
    const { value } = e.target;
    setResearchTools(prev => ({
        ...prev,
        'อื่นๆ': { ...prev['อื่นๆ'], otherText: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("current_user");

    const researchToolsData = Object.entries(researchTools)
        .filter(([_, data]) => data.checked)
        .map(([type, data]) => {
            let finalType = type;
            if (type === 'อื่นๆ') {
                if (!data.otherText.trim()) return null;
                finalType = `อื่นๆ: ${data.otherText.trim()}`;
            }
            return { type: finalType, quantity: data.quantity };
        }).filter(Boolean);

    if (researchToolsData.length === 0) {
        alert("กรุณาเลือกเครื่องมือที่ใช้ในการวิจัยอย่างน้อย 1 รายการ");
        return;
    }

    const submissionData = {
        doc_id: `form5_${userEmail}_${Date.now()}`,
        type: "ฟอร์ม 5",
        title: "แบบขอหนังสือขออนุญาตเก็บรวบรวมข้อมูล (วิทยานิพนธ์)",
        student_email: userEmail,
        student_id: displayData.student_id,
        details: { research_tools: researchToolsData },
        student_comment: comment,
        submitted_date: new Date().toISOString(),
        status: "รอตรวจ"
    };
    
    const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
    existingPendingDocs.push(submissionData);
    localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));
    
    alert("✅ ยืนยันและส่งแบบฟอร์มเรียบร้อยแล้ว!");
    navigate("/student/status");
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.formBlockedMessage}>⚠️ {error}</div>;

  return (
    <div className={styles.formContainer}>
      <h2>📑 แบบขอหนังสือขออนุญาตเก็บรวบรวมข้อมูล (วิทยานิพนธ์)</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
            <legend>📌 ข้อมูลนักศึกษา</legend>
            <div className={`${styles.infoGrid} ${styles.threeCols}`}>
                <div><label>ชื่อ-นามสกุล:</label><input type="text" value={displayData?.fullname || ''} disabled /></div>
                <div><label>รหัสนักศึกษา:</label><input type="text" value={displayData?.student_id || ''} disabled /></div>
                <div><label>ระดับปริญญา:</label><input type="text" value={displayData?.degree || ''} disabled /></div>
                <div className={styles.fullWidth}><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={displayData?.programName || ''} disabled /></div>
                <div><label>อีเมล:</label><input type="email" value={displayData?.email || ''} disabled /></div>
                <div><label>เบอร์โทรศัพท์:</label><input type="text" value={displayData?.phone || ''} disabled /></div>
            </div>
        </fieldset>
        <fieldset>
            <legend>📖 ข้อมูลวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</legend>
            <div className={styles.formGroup}>
                <label>วันที่อนุมัติหัวข้อ:</label>
                {/* --- ✅ แก้ไขการแสดงผลวันที่ --- */}
                <input type="text" value={displayData?.proposal_approval_date ? new Date(displayData.proposal_approval_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)'} disabled />
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
            <legend>📋 รายละเอียดการขออนุญาต</legend>
            <div className={styles.formGroup}>
                <label>เครื่องมือที่ใช้ในการวิจัย* (เลือกและระบุจำนวน)</label>
                <div className={styles.checkboxGroup}>
                    {Object.keys(initialToolState).map(toolName => (
                        <div key={toolName} className={`${styles.checkboxItem} ${toolName === 'อื่นๆ' ? styles.otherItem : ''}`}>
                            <label>
                                <input type="checkbox" name="research-tool" value={toolName} 
                                    checked={researchTools[toolName].checked}
                                    onChange={handleToolChange}
                                /> 
                                {toolName === 'อื่นๆ' ? 'อื่นๆ:' : toolName}
                            </label>
                            {toolName === 'อื่นๆ' && (
                                <input type="text" placeholder="ระบุเพิ่มเติม"
                                    disabled={!researchTools['อื่นๆ'].checked}
                                    value={researchTools['อื่นๆ'].otherText}
                                    onChange={handleOtherTextChange}
                                />
                            )}
                            <div className={styles.quantityWrapper}>
                                <input type="number" className={styles.quantityInput} min="1"
                                    disabled={!researchTools[toolName].checked}
                                    value={researchTools[toolName].quantity}
                                    onChange={(e) => handleQuantityChange(toolName, e.target.value)}
                                />
                                <span>ฉบับ</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </fieldset>
        <fieldset>
            <legend>📝 ความคิดเห็นเพิ่มเติม (ถ้ามี)</legend>
            <div className={styles.formGroup}>
                <label htmlFor="student-comment">คุณสามารถใส่คำแนะนำหรือข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ได้ที่นี่</label>
                <textarea id="student-comment" rows="4" maxLength="250" placeholder="ความคิดเห็นเพิ่มเติม..." 
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

export default Form5Page;