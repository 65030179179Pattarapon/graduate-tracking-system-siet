import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// ฟังก์ชันสำหรับหาชื่ออาจารย์จาก ID
const findAdvisorName = (id, advisors) => {
  if (!id) return '-';
  const advisor = advisors.find(a => a.advisor_id === id);
  return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่พบข้อมูล';
};

function Form2Detail({ doc, user, advisors, programs, departments }) {
  const programName = programs.find(p => p.id === user.program_id)?.name || '-';
  const departmentName = departments.find(d => d.id === user.department_id)?.name || '-';
  
  const mainAdvisorName = findAdvisorName(user.main_advisor_id, advisors);
  const coAdvisor1Name = findAdvisorName(user.co_advisor1_id, advisors);
  
  const committee = doc.committee || {};
  const chairName = findAdvisorName(committee.chair_id, advisors);
  const coAdvisor2Name = findAdvisorName(committee.co_advisor2_id, advisors);
  const member5Name = findAdvisorName(committee.member5_id, advisors);
  const reserveExternalName = findAdvisorName(committee.reserve_external_id, advisors);
  const reserveInternalName = findAdvisorName(committee.reserve_internal_id, advisors);

  return (
    <>
      <h4><i className={styles.iconPrefix}></i>ข้อมูลผู้ยื่นคำร้อง</h4>
      <ul className={styles.infoList}>
        <li><label>ชื่อ-นามสกุล:</label> <span>{user.fullname}</span></li>
        <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
        <li><label>หลักสูตร:</label> <span>{programName}</span></li>
        <li><label>ภาควิชา:</label> <span>{departmentName}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />
      
      <h4><i className={styles.iconPrefix}></i>รายละเอียดหัวข้อวิทยานิพนธ์</h4>
      <ul className={styles.infoList}>
        <li><label>ชื่อหัวข้อวิทยานิพนธ์ (ภาษาไทย):</label> <span className={styles.thesisTitle}>{doc.thesis_title_th || '-'}</span></li>
        <li><label>ชื่อหัวข้อวิทยานิพนธ์ (ภาษาอังกฤษ):</label> <span className={styles.thesisTitle}>{doc.thesis_title_en || '-'}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />

      <h4><i className={styles.iconPrefix}></i>คณะกรรมการสอบและอาจารย์ที่ปรึกษา</h4>
      <div className={styles.subsection}>
        <h5>อาจารย์ที่ปรึกษา (จากระบบ)</h5>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>ที่ปรึกษาหลัก:</label> <span>{mainAdvisorName}</span></li>
            <li><label>ที่ปรึกษาร่วม 1:</label> <span>{coAdvisor1Name}</span></li>
        </ul>
      </div>
      <div className={styles.subsection}>
        <h5>คณะกรรมการสอบที่เสนอชื่อ</h5>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>ประธานกรรมการสอบ:</label> <span>{chairName}</span></li>
            <li><label>กรรมการ (ที่ปรึกษาร่วม 2):</label> <span>{coAdvisor2Name}</span></li>
            <li><label>กรรมการสอบ (คนที่ 5):</label> <span>{member5Name}</span></li>
        </ul>
      </div>
      <div className={styles.subsection}>
        <h5>กรรมการสำรองที่เสนอชื่อ</h5>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>กรรมการสำรอง (จากภายนอก):</label> <span>{reserveExternalName}</span></li>
            <li><label>กรรมการสำรอง (จากภายใน):</label> <span>{reserveInternalName}</span></li>
        </ul>
      </div>
      <hr className={styles.subtleDivider} />
      <h4><i className={styles.iconPrefix}></i>เอกสารแนบ</h4>
      <ul className={styles.infoList}>
        {doc.files && doc.files.length > 0 ? (
          doc.files.map((file, index) => (
            <li key={index}>
              <label>{file.type}:</label>
              {/* ในอนาคตสามารถทำเป็นลิงก์สำหรับดาวน์โหลดได้ */}
              <a href="#" onClick={(e) => e.preventDefault()} className={styles.fileLink}>
                {file.name}
              </a>
            </li>
          ))
        ) : (
          <li>ไม่มีไฟล์แนบ</li>
        )}
      </ul>
      {/* --- จบส่วนที่เพิ่มเข้ามา --- */}
    </>
  );
}

export default Form2Detail;