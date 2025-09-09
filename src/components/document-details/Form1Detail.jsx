import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// Component นี้จะรับ props เป็นข้อมูลที่ผ่านการประมวลผลมาแล้ว
function Form1Detail({ doc, user, advisors, programs, departments }) {
  const mainAdvisor = advisors.find(a => a.advisor_id === doc.selected_main_advisor_id);
  const coAdvisor = advisors.find(a => a.advisor_id === doc.selected_co_advisor_id);
  const programName = programs.find(p => p.id === user.program_id)?.name || '-';
  const departmentName = departments.find(d => d.id === user.department_id)?.name || '-';

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
      <h4>อาจารย์ที่ปรึกษาที่เลือก</h4>
      <ul className={styles.infoList}>
        <li><label>ที่ปรึกษาหลัก:</label> <span>{mainAdvisor ? `${mainAdvisor.prefix_th}${mainAdvisor.first_name_th} ${mainAdvisor.last_name_th}`.trim() : '-'}</span></li>
        <li><label>ที่ปรึกษาร่วม:</label> <span>{coAdvisor ? `${coAdvisor.prefix_th}${coAdvisor.first_name_th} ${coAdvisor.last_name_th}`.trim() : '-'}</span></li>
      </ul>
    </>
  );
}

export default Form1Detail;