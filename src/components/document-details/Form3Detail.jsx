import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// ฟังก์ชันสำหรับหาชื่ออาจารย์จาก ID
const findAdvisorName = (id, advisors) => {
  if (!id) return '-';
  const advisor = advisors.find(a => a.advisor_id === id);
  return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่พบข้อมูล';
};

// ฟังก์ชันสำหรับแปลงวันที่
const formatSimpleDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Form3Detail({ doc, user, advisors, programs, departments, allUserDocs }) {
  const programName = programs.find(p => p.id === user.program_id)?.name || '-';
  const departmentName = departments.find(d => d.id === user.department_id)?.name || '-';

  // ค้นหาข้อมูลจาก "ฟอร์ม 2" ที่เคยอนุมัติแล้ว เพื่อนำข้อมูลมาแสดง
  const approvedForm2 = allUserDocs.find(d => d.type === 'ฟอร์ม 2' && (d.status === 'อนุมัติแล้ว' || d.status === 'อนุมัติ'));

  // ค้นหาชื่ออาจารย์ทั้งหมด
  const mainAdvisorName = findAdvisorName(user.main_advisor_id, advisors);
  const coAdvisor1Name = findAdvisorName(user.co_advisor1_id, advisors);
  const coAdvisor2Name = findAdvisorName(approvedForm2?.committee?.co_advisor2_id, advisors);
  const programChairName = findAdvisorName(approvedForm2?.committee?.chair_id, advisors); // <-- ดึงข้อมูลประธานกรรมการสอบจากฟอร์ม 2

  return (
    <>
      <h4>ข้อมูลผู้ยื่นคำร้อง</h4>
      <ul className={styles.infoList}>
        <li><label>ชื่อ-นามสกุล:</label> <span>{user.fullname}</span></li>
        <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
        <li><label>หลักสูตร:</label> <span>{programName}</span></li>
        <li><label>ภาควิชา:</label> <span>{departmentName}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />
      
      <h4>ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</h4>
      <ul className={styles.infoList}>
        <li><label>วันที่อนุมัติ:</label> <span>{formatSimpleDate(approvedForm2?.action_date)}</span></li>
        <li><label>ภาษาไทย:</label> <span className={styles.thesisTitle}>{approvedForm2?.thesis_title_th || '-'}</span></li>
        <li><label>ภาษาอังกฤษ:</label> <span className={styles.thesisTitle}>{approvedForm2?.thesis_title_en || '-'}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />

      <h4>อาจารย์ผู้รับผิดชอบ</h4>
      <div className={styles.subsection}>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>ประธานกรรมการสอบ (จากฟอร์ม 2):</label> <span>{programChairName}</span></li>
            <li><label>อาจารย์ที่ปรึกษาหลัก:</label> <span>{mainAdvisorName}</span></li>
            <li><label>อาจารย์ที่ปรึกษาร่วม 1:</label> <span>{coAdvisor1Name}</span></li>
            <li><label>อาจารย์ที่ปรึกษาร่วม 2:</label> <span>{coAdvisor2Name}</span></li>
        </ul>
      </div>

      <hr className={styles.subtleDivider} />
      <h4>เอกสารแนบ</h4>
      <ul className={styles.infoList}>
        {doc.files && doc.files.length > 0 ? (
          doc.files.map((file, index) => (
            <li key={index}>
              <label>{file.type}:</label>
              <a href="#" onClick={(e) => e.preventDefault()} className={styles.fileLink}>
                {file.name}
              </a>
            </li>
          ))
        ) : (
          <li>ไม่มีไฟล์แนบ</li>
        )}
      </ul>
    </>
  );
}

export default Form3Detail;