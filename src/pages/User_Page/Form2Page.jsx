import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form2Page.module.css';

function Form2Page() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const [advisorLists, setAdvisorLists] = useState({
    mainAdvisorName: '', coAdvisor1Name: '', potentialChairs: [],
    potentialCoAdvisors2: [], internalMembers: [], externalMembers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    thesisTitleTh: '', thesisTitleEn: '', committeeChair: '', coAdvisor2: '',
    committeeMember5: '', reserveExternal: '', reserveInternal: '',
    registrationSemester: '', registrationYear: '', comment: '',
    files: {
      proposalFile: null,
      coverPageFile: null,
      registrationProofFile: null,
    },
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const [students, allAdvisors, programs, departments] = await Promise.all([
          fetch("/data/student.json").then(res => res.json()),
          fetch("/data/advisor.json").then(res => res.json()),
          fetch("/data/structures/programs.json").then(res => res.json()),
          fetch("/data/structures/departments.json").then(res => res.json())
        ]);

        const currentUser = students.find(s => s.email === userEmail);
        if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");
        
        const programName = programs.find(p => p.id === currentUser.program_id)?.name || '';
        const departmentName = departments.find(d => d.id === currentUser.department_id)?.name || '';
        const fullname = `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim();
        setStudentInfo({ ...currentUser, programName, departmentName, fullname });

        const mainAdvisor = allAdvisors.find(a => a.advisor_id === currentUser.main_advisor_id);
        const coAdvisor1 = allAdvisors.find(a => a.advisor_id === currentUser.co_advisor1_id);
        const mainAdvisorName = mainAdvisor ? `${mainAdvisor.prefix_th}${mainAdvisor.first_name_th} ${mainAdvisor.last_name_th}`.trim() : 'ไม่มีข้อมูล';
        const coAdvisor1Name = coAdvisor1 ? `${coAdvisor1.prefix_th}${coAdvisor1.first_name_th} ${coAdvisor1.last_name_th}`.trim() : 'ไม่มีข้อมูล';
        
        const usedAdvisorIds = [currentUser.main_advisor_id, currentUser.co_advisor1_id].filter(Boolean);
        const internalAdvisors = allAdvisors.filter(a => a.type !== 'อาจารย์บัณฑิตพิเศษภายนอก');
        const externalAdvisors = allAdvisors.filter(a => a.type === 'อาจารย์บัณฑิตพิเศษภายนอก');

        setAdvisorLists({
          mainAdvisorName, coAdvisor1Name,
          potentialChairs: internalAdvisors.filter(a => a.roles?.includes("สอบ") && !usedAdvisorIds.includes(a.advisor_id)),
          potentialCoAdvisors2: internalAdvisors.filter(a => a.roles?.includes("ที่ปรึกษาวิทยานิพนธ์ร่วม") && !usedAdvisorIds.includes(a.advisor_id)),
          internalMembers: internalAdvisors.filter(a => !usedAdvisorIds.includes(a.advisor_id)),
          externalMembers: externalAdvisors,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadFormData();
  }, []);

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    // ใช้ name สำหรับ select, ใช้ id สำหรับ input/textarea อื่นๆ
    const key = name || id;
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: { ...prev.files, [name]: files[0] }
      }));
    }
  };
  
  const handleSubmit = (e) => {
     e.preventDefault();
     const userEmail = localStorage.getItem("current_user");

     if (!formData.files.proposalFile || !formData.files.coverPageFile || !formData.files.registrationProofFile) {
         alert("กรุณาแนบไฟล์ประกอบให้ครบถ้วน");
         return;
     }

     const submissionData = {
       doc_id: `form2_${userEmail}_${Date.now()}`, type: "ฟอร์ม 2",
       title: "แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์", student_email: userEmail,
       student_id: studentInfo.student_id, thesis_title_th: formData.thesisTitleTh,
       thesis_title_en: formData.thesisTitleEn,
       committee: {
         chair_id: formData.committeeChair, co_advisor2_id: formData.coAdvisor2,
         member5_id: formData.committeeMember5, reserve_external_id: formData.reserveExternal,
         reserve_internal_id: formData.reserveInternal,
       },
       files: [
           { type: 'เค้าโครงวิทยานิพนธ์', name: formData.files.proposalFile.name },
           { type: 'หน้าปก', name: formData.files.coverPageFile.name },
           { type: 'สำเนาลงทะเบียน', name: formData.files.registrationProofFile.name }
       ],
       details: {
         registration_semester: formData.registrationSemester,
         registration_year: formData.registrationYear,
       },
       student_comment: formData.comment, submitted_date: new Date().toISOString(),
       status: "รอตรวจ"
     };

     const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
     existingPendingDocs.push(submissionData);
     localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));
     
     alert("✅ ยืนยันและส่งแบบฟอร์มเสนอหัวข้อเรียบร้อยแล้ว!");
     navigate("/student/status");
  };

  if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

  const currentThaiYear = new Date().getFullYear() + 543;
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentThaiYear - i);

  return (
    <div className={styles.formContainer}>
      <h2>📑 แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์ ระดับบัณฑิตศึกษา</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>📌 ข้อมูลนักศึกษา</legend>
          <div className={`${styles.infoGrid} ${styles.threeCols}`}>
            <div><label>ชื่อ-นามสกุล:</label><input type="text" value={studentInfo?.fullname || ''} disabled /></div>
            <div><label>รหัสนักศึกษา:</label><input type="text" value={studentInfo?.student_id || ''} disabled /></div>
            <div><label>ระดับปริญญา:</label><input type="text" value={studentInfo?.degree || ''} disabled /></div>
          </div>
          <div className={styles.infoGrid}>
            <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={studentInfo?.programName || ''} disabled /></div>
            <div><label>ภาควิชา:</label><input type="text" value={studentInfo?.departmentName || ''} disabled /></div>
          </div>
        </fieldset>
        
        <fieldset>
          <legend>📖 หัวข้อวิทยานิพนธ์</legend>
          <div className={styles.formGroup}>
            <label htmlFor="thesisTitleTh">ชื่อเรื่อง (ภาษาไทย)*</label>
            <textarea id="thesisTitleTh" name="thesisTitleTh" value={formData.thesisTitleTh} onChange={handleChange} rows="3" placeholder="กรอกชื่อเรื่องวิทยานิพนธ์ภาษาไทย..." required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="thesisTitleEn">ชื่อเรื่อง (ภาษาอังกฤษ)*</label>
            <textarea id="thesisTitleEn" name="thesisTitleEn" value={formData.thesisTitleEn} onChange={handleChange} rows="3" placeholder="กรอกชื่อเรื่องวิทยานิพนธ์ภาษาอังกฤษ..." required />
          </div>
        </fieldset>

        <fieldset>
            <legend>👨‍🏫 อาจารย์ที่ปรึกษาและคณะกรรมการสอบ</legend>
            <div className={styles.subSection}>
              <label className={styles.subSectionLabel}>รายชื่ออาจารย์ที่ปรึกษา</label>
              <div className={`${styles.infoGrid}`}>
                <div><label>อาจารย์ที่ปรึกษาหลัก:</label><input type="text" value={advisorLists.mainAdvisorName} disabled /></div>
                <div><label>อาจารย์ที่ปรึกษาร่วม 1:</label><input type="text" value={advisorLists.coAdvisor1Name} disabled /></div>
              </div>
            </div>
            <div className={styles.subSection}>
                <label className={styles.subSectionLabel}>เสนอชื่อคณะกรรมการสอบ*</label>
                <div className={styles.formGroup}>
                    <label htmlFor="committeeChair">ประธานกรรมการสอบ*</label>
                    <select id="committeeChair" name="committeeChair" value={formData.committeeChair} onChange={handleChange} required>
                        <option value="">-- เลือก --</option>
                        {advisorLists.potentialChairs.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="coAdvisor2">กรรมการ (ที่ปรึกษาร่วม 2)*</label>
                    <select id="coAdvisor2" name="coAdvisor2" value={formData.coAdvisor2} onChange={handleChange} required>
                        <option value="">-- เลือก --</option>
                        {advisorLists.potentialCoAdvisors2.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="committeeMember5">กรรมการสอบ (คนที่ 5)*</label>
                    <select id="committeeMember5" name="committeeMember5" value={formData.committeeMember5} onChange={handleChange} required>
                        <option value="">-- เลือก --</option>
                        {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                    </select>
                </div>
            </div>
            <div className={styles.subSection}>
              <label className={styles.subSectionLabel}>เสนอชื่อกรรมการสำรอง*</label>
              <div className={styles.infoGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="reserveExternal">กรรมการสำรอง (จากภายนอก)*</label>
                  <select id="reserveExternal" name="reserveExternal" value={formData.reserveExternal} onChange={handleChange} required>
                    <option value="">-- เลือก --</option>
                    {advisorLists.externalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="reserveInternal">กรรมการสำรอง (จากภายใน)*</label>
                  <select id="reserveInternal" name="reserveInternal" value={formData.reserveInternal} onChange={handleChange} required>
                    <option value="">-- เลือก --</option>
                    {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                  </select>
                </div>
              </div>
            </div>
        </fieldset>

        <fieldset>
          <legend>📎 แนบเอกสารประกอบ</legend>
          <div className={styles.subSection}>
            <label>1. ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์* (.pdf, .docx)</label>
            <small className={styles.fileNamingInstruction}>*กรุณาตั้งชื่อไฟล์เป็น: รหัสนักศึกษา_F2_PROPOSAL_DD-MM-YYYY.pdf</small>
            <div className={styles.fileInputWrapper}>
              <label htmlFor="proposalFile" className={styles.fileInputLabel}>เลือกไฟล์</label>
              <input type="file" id="proposalFile" name="proposalFile" onChange={handleFileChange} required />
              <span className={styles.fileNameDisplay}>{formData.files.proposalFile?.name || 'ยังไม่ได้เลือกไฟล์'}</span>
            </div>
          </div>

          <div className={styles.subSection}>
            <label>2. ไฟล์หน้าปกของหัวข้อและเค้าโครง* (.pdf, .docx)</label>
            <small className={styles.fileNamingInstruction}>*กรุณาตั้งชื่อไฟล์เป็น: รหัสนักศึกษา_F2_COVER_DDMMYYYY.pdf</small>
            <div className={styles.fileInputWrapper}>
              <label htmlFor="coverPageFile" className={styles.fileInputLabel}>เลือกไฟล์</label>
              <input type="file" id="coverPageFile" name="coverPageFile" onChange={handleFileChange} required />
              <span className={styles.fileNameDisplay}>{formData.files.coverPageFile?.name || 'ยังไม่ได้เลือกไฟล์'}</span>
            </div>
          </div>
          
          <div className={styles.subSection}>
            <label>3. ไฟล์สำเนาการลงทะเบียนภาคการศึกษาล่าสุด* (.pdf, .jpg)</label>
            <small className={styles.fileNamingInstruction}>*กรุณาตั้งชื่อไฟล์เป็น: รหัสนักศึกษา_F2_REGIS_DDMMYYYY.jpg</small>

            {/* --- ✅ นี่คือส่วนของ Dropdown ที่เพิ่มเข้ามา --- */}
            <div className={styles.inlineSelectGroup}>
              <label htmlFor="registrationSemester">ภาคการศึกษาที่:</label>
              <select 
                id="registrationSemester" 
                name="registrationSemester" 
                value={formData.registrationSemester} 
                onChange={handleChange} 
                className={styles.inlineSelect} 
                required
              >
                <option value="">เลือก</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="ภาคพิเศษ">ภาคพิเศษ</option>
              </select>
              
              <label htmlFor="registrationYear">ปีการศึกษา:</label>
              <select 
                id="registrationYear" 
                name="registrationYear" 
                value={formData.registrationYear} 
                onChange={handleChange} 
                className={styles.inlineSelect} 
                required
              >
                <option value="">เลือกปี</option>
                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>

            <div className={styles.fileInputWrapper}>
              <label htmlFor="registrationProofFile" className={styles.fileInputLabel}>เลือกไฟล์</label>
              <input type="file" id="registrationProofFile" name="registrationProofFile" onChange={handleFileChange} required />
              <span className={styles.fileNameDisplay}>{formData.files.registrationProofFile?.name || 'ยังไม่ได้เลือกไฟล์'}</span>
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

export default Form2Page;