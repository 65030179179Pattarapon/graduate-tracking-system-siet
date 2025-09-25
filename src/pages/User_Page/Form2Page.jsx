import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Form2Page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function Form2Page() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State สำหรับข้อมูล ---
  const [studentInfo, setStudentInfo] = useState(null);
  const [advisorLists, setAdvisorLists] = useState({
    mainAdvisorName: '', coAdvisor1Name: '', potentialChairs: [],
    potentialCoAdvisors2: [], internalMembers: [], externalMembers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State สำหรับค่าในฟอร์ม ---
  const [formData, setFormData] = useState({
    thesisTitleTh: '', thesisTitleEn: '', committeeChair: '', coAdvisor2: '',
    committeeMember5: '', reserveExternal: '', reserveInternal: '',
    registrationSemester: '', registrationYear: '', comment: '',
    files: {
      proposalFile_th: null, proposalFile_en: null, coverPageFile_th: null,
      coverPageFile_en: null, registrationProofFile: null,
    },
  });
  
  const [editingDoc, setEditingDoc] = useState(null);
  const isEditMode = !!editingDoc;

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

        const queryParams = new URLSearchParams(location.search);
        const docIdToEdit = queryParams.get('edit');

        if (docIdToEdit) {
          const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
          const docToEdit = rejectedDocs.find(doc => doc.doc_id === docIdToEdit);
          
          if (docToEdit) {
            setEditingDoc(docToEdit);
            setFormData(prev => ({
              ...prev,
              thesisTitleTh: docToEdit.thesis_title_th || '',
              thesisTitleEn: docToEdit.thesis_title_en || '',
              committeeChair: docToEdit.committee?.chair_id || '',
              coAdvisor2: docToEdit.committee?.co_advisor2_id || '',
              committeeMember5: docToEdit.committee?.member5_id || '',
              reserveExternal: docToEdit.committee?.reserve_external_id || '',
              reserveInternal: docToEdit.committee?.reserve_internal_id || '',
              registrationSemester: docToEdit.details?.registration_semester || '',
              registrationYear: docToEdit.details?.registration_year || '',
              comment: docToEdit.student_comment || '',
            }));
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

  const handleChange = (e) => {
    const { id, value, name } = e.target;
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

  const handleRemoveFile = (fileName) => {
    setFormData(prev => ({
        ...prev,
        files: { ...prev.files, [fileName]: null }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("current_user");

    if (!formData.files.proposalFile_th || !formData.files.proposalFile_en ||
        !formData.files.coverPageFile_th || !formData.files.coverPageFile_en ||
        !formData.files.registrationProofFile) {
        alert("กรุณาแนบไฟล์ประกอบให้ครบถ้วนทุกช่อง");
        return;
    }

    try {
      const filePromises = [
        fileToDataUrl(formData.files.proposalFile_th),
        fileToDataUrl(formData.files.proposalFile_en),
        fileToDataUrl(formData.files.coverPageFile_th),
        fileToDataUrl(formData.files.coverPageFile_en),
        fileToDataUrl(formData.files.registrationProofFile)
      ];
      const fileUrls = await Promise.all(filePromises);

      const commonData = {
          type: "ฟอร์ม 2",
          title: "แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์", 
          student_email: userEmail,
          student_id: studentInfo.student_id, 
          thesis_title_th: formData.thesisTitleTh,
          thesis_title_en: formData.thesisTitleEn,
          committee: {
            chair_id: formData.committeeChair, 
            co_advisor2_id: formData.coAdvisor2,
            member5_id: formData.committeeMember5, 
            reserve_external_id: formData.reserveExternal,
            reserve_internal_id: formData.reserveInternal,
          },
          files: [
              { type: 'เค้าโครงวิทยานิพนธ์ (ไทย)', name: formData.files.proposalFile_th.name, url: fileUrls[0] },
              { type: 'เค้าโครงวิทยานิพนธ์ (อังกฤษ)', name: formData.files.proposalFile_en.name, url: fileUrls[1] },
              { type: 'หน้าปก (ไทย)', name: formData.files.coverPageFile_th.name, url: fileUrls[2] },
              { type: 'หน้าปก (อังกฤษ)', name: formData.files.coverPageFile_en.name, url: fileUrls[3] },
              { type: 'สำเนาลงทะเบียน', name: formData.files.registrationProofFile.name, url: fileUrls[4] }
          ],
          details: {
            registration_semester: formData.registrationSemester,
            registration_year: formData.registrationYear,
          },
          student_comment: formData.comment, 
          submitted_date: new Date().toISOString(),
          status: "รอตรวจ"
      };

      if (isEditMode) {
          const submissionData = { ...editingDoc, ...commonData };

          const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
          const updatedRejectedDocs = rejectedDocs.filter(doc => doc.doc_id !== editingDoc.doc_id);
          localStorage.setItem('localStorage_rejectedDocs', JSON.stringify(updatedRejectedDocs));

          const pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
          pendingDocs.push(submissionData);
          localStorage.setItem('localStorage_pendingDocs', JSON.stringify(pendingDocs));
          
          alert("✅ แก้ไขและส่งแบบฟอร์มเรียบร้อยแล้ว!");
          navigate("/student/status");
      } else {
          const formPrefix = "Form2";
          const timestamp = Date.now();
          const newDocId = `${formPrefix}-${timestamp}`;
          const submissionData = { ...commonData, doc_id: newDocId };

          const existingPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
          existingPendingDocs.push(submissionData);
          localStorage.setItem('localStorage_pendingDocs', JSON.stringify(existingPendingDocs));
          
          alert("✅ ยืนยันและส่งแบบฟอร์มเสนอหัวข้อเรียบร้อยแล้ว!");
          navigate("/student/status");
      }
    } catch (error) {
      console.error("Error converting files to Data URL:", error);
      alert("เกิดข้อผิดพลาดในการประมวลผลไฟล์แนบ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

  const currentThaiYear = new Date().getFullYear() + 543;
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentThaiYear - i);
      
  return (
      <div className={styles.formContainer}>
          {/* ✅✅✅ แก้ไขส่วนนี้ทั้งหมด ✅✅✅ */}
            <div className={styles.titleContainer}>
              <h2>{isEditMode ? '📝 แก้ไขแบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์' : '📑 แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์'}</h2>
            </div>  
                {isEditMode && (
                  <div className={styles.backButtonContainer}>
                    <button type="button" className={styles.backButton} onClick={() => navigate('/student/status')}>
                        กลับไปหน้าสถานะ
                    </button>
                  </div>
                )}
      
      {isEditMode && editingDoc.admin_comment && (
        <div className={styles.rejectionNotice}>
            <strong>เหตุผลที่ส่งกลับแก้ไข:</strong>
            <p>{editingDoc.admin_comment}</p>
        </div>
      )}

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
          {/* --- ✅ ส่วนที่แก้ไข: เงื่อนไขการเปลี่ยนสี --- */}
          <div className={`${styles.subSection} ${formData.files.proposalFile_th && formData.files.proposalFile_en ? styles.attached : ''}`}>
            <label>1. ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์* (.pdf, .docx)</label>
            <div className={styles.fileGroup}>
                <div className={styles.fileInputSubgroup}>
                    <label className={styles.subLabel}>ไฟล์ภาษาไทย:</label>
                    <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F2_PROPOSAL_TH_DD-MM-YYYY.pdf</small>
                    <div className={styles.fileInputWrapper}>
                        <label htmlFor="proposalFile_th" className={styles.fileInputLabel}>
                            {formData.files.proposalFile_th ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                        </label>
                        <input type="file" id="proposalFile_th" name="proposalFile_th" onChange={handleFileChange} />
                        {formData.files.proposalFile_th ? (
                            <div className={styles.fileInfo}>
                                <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                                <a href={URL.createObjectURL(formData.files.proposalFile_th)} target="_blank" rel="noopener noreferrer" className={styles.fileNameDisplay}>
                                    {formData.files.proposalFile_th.name}
                                </a>
                                <button type="button" onClick={() => handleRemoveFile('proposalFile_th')} className={styles.removeFileBtn}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ) : (
                            <span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>
                        )}
                    </div>
                </div>
                <div className={styles.fileInputSubgroup}>
                    <label className={styles.subLabel}>ไฟล์ภาษาอังกฤษ:</label>
                    <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F2_PROPOSAL_EN_DD-MM-YYYY.pdf</small>
                     <div className={styles.fileInputWrapper}>
                        <label htmlFor="proposalFile_en" className={styles.fileInputLabel}>
                            {formData.files.proposalFile_en ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                        </label>
                        <input type="file" id="proposalFile_en" name="proposalFile_en" onChange={handleFileChange} />
                        {formData.files.proposalFile_en ? (
                            <div className={styles.fileInfo}>
                                <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                                <a href={URL.createObjectURL(formData.files.proposalFile_en)} target="_blank" rel="noopener noreferrer" className={styles.fileNameDisplay}>
                                    {formData.files.proposalFile_en.name}
                                </a>
                                <button type="button" onClick={() => handleRemoveFile('proposalFile_en')} className={styles.removeFileBtn}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ) : (
                            <span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>
                        )}
                    </div>
                </div>
            </div>
          </div>

          <div className={`${styles.subSection} ${formData.files.coverPageFile_th && formData.files.coverPageFile_en ? styles.attached : ''}`}>
            <label>2. ไฟล์หน้าปกของหัวข้อและเค้าโครง* (.pdf, .docx)</label>
            <div className={styles.fileGroup}>
                <div className={styles.fileInputSubgroup}>
                    <label className={styles.subLabel}>ไฟล์ภาษาไทย:</label>
                    <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F2_COVER_TH_DDMMYYYY.pdf</small>
                    <div className={styles.fileInputWrapper}>
                        <label htmlFor="coverPageFile_th" className={styles.fileInputLabel}>
                            {formData.files.coverPageFile_th ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                        </label>
                        <input type="file" id="coverPageFile_th" name="coverPageFile_th" onChange={handleFileChange} />
                        {formData.files.coverPageFile_th ? (
                             <div className={styles.fileInfo}>
                                <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                                <a href={URL.createObjectURL(formData.files.coverPageFile_th)} target="_blank" rel="noopener noreferrer" className={styles.fileNameDisplay}>
                                    {formData.files.coverPageFile_th.name}
                                </a>
                                <button type="button" onClick={() => handleRemoveFile('coverPageFile_th')} className={styles.removeFileBtn}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ) : (
                            <span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>
                        )}
                    </div>
                </div>
                <div className={styles.fileInputSubgroup}>
                    <label className={styles.subLabel}>ไฟล์ภาษาอังกฤษ:</label>
                    <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F2_COVER_EN_DDMMYYYY.pdf</small>
                    <div className={styles.fileInputWrapper}>
                        <label htmlFor="coverPageFile_en" className={styles.fileInputLabel}>
                             {formData.files.coverPageFile_en ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                        </label>
                        <input type="file" id="coverPageFile_en" name="coverPageFile_en" onChange={handleFileChange} />
                        {formData.files.coverPageFile_en ? (
                             <div className={styles.fileInfo}>
                                <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                                <a href={URL.createObjectURL(formData.files.coverPageFile_en)} target="_blank" rel="noopener noreferrer" className={styles.fileNameDisplay}>
                                    {formData.files.coverPageFile_en.name}
                                </a>
                                <button type="button" onClick={() => handleRemoveFile('coverPageFile_en')} className={styles.removeFileBtn}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ) : (
                            <span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>
                        )}
                    </div>
                </div>
            </div>
          </div>
          
          <div className={`${styles.subSection} ${formData.files.registrationProofFile ? styles.attached : ''}`}>
            <label>3. ไฟล์สำเนาการลงทะเบียนภาคการศึกษาล่าสุด* (.pdf, .jpg)</label>
            <small className={styles.fileNamingInstruction}>*กรุณาตั้งชื่อไฟล์เป็น: รหัสนักศึกษา_F2_REGIS_DDMMYYYY.jpg</small>
            <div className={styles.inlineSelectGroup}>
              <label htmlFor="registrationSemester">ภาคการศึกษาที่:</label>
              <select id="registrationSemester" name="registrationSemester" value={formData.registrationSemester} onChange={handleChange} className={styles.inlineSelect} required>
                <option value="">เลือก</option><option value="1">1</option><option value="2">2</option><option value="ภาคพิเศษ">ภาคพิเศษ</option>
              </select>
              <label htmlFor="registrationYear">ปีการศึกษา:</label>
              <select id="registrationYear" name="registrationYear" value={formData.registrationYear} onChange={handleChange} className={styles.inlineSelect} required>
                <option value="">เลือกปี</option>
                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <div className={styles.fileInputWrapper}>
              <label htmlFor="registrationProofFile" className={styles.fileInputLabel}>
                {formData.files.registrationProofFile ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
              </label>
              <input type="file" id="registrationProofFile" name="registrationProofFile" onChange={handleFileChange} />
              
              {formData.files.registrationProofFile ? (
                <div className={styles.fileInfo}>
                  <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                  <a href={URL.createObjectURL(formData.files.registrationProofFile)} target="_blank" rel="noopener noreferrer" className={styles.fileNameDisplay}>
                    {formData.files.registrationProofFile.name}
                  </a>
                  <button type="button" onClick={() => handleRemoveFile('registrationProofFile')} className={styles.removeFileBtn}>
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

export default Form2Page;

