import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// ฟังก์ชันสำหรับแปลงวันที่
const formatSimpleDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Form5Detail({ doc, user, programs, allUserDocs }) {
  const programName = programs.find(p => p.id === user.program_id)?.name || '-';

  // ค้นหาข้อมูลจาก "ฟอร์ม 2" ที่เคยอนุมัติแล้ว
  const approvedForm2 = allUserDocs.find(d => d.type === 'ฟอร์ม 2' && (d.status === 'อนุมัติแล้ว' || d.status === 'อนุมัติ'));

  const details = doc.details || {};
  const researchTools = details.research_tools || [];

  return (
    <>
      <h4>ข้อมูลผู้ยื่นคำร้อง</h4>
      <ul className={styles.infoList}>
        <li><label>ชื่อ-นามสกุล:</label> <span>{user.fullname}</span></li>
        <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
        <li><label>หลักสูตร:</label> <span>{programName}</span></li>
        <li><label>อีเมล:</label> <span>{user.email}</span></li>
        <li><label>เบอร์โทรศัพท์:</label> <span>{user.phone}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />
      
      <h4>ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</h4>
      <ul className={styles.infoList}>
        <li><label>วันที่อนุมัติ:</label> <span>{formatSimpleDate(approvedForm2?.action_date)}</span></li>
        <li><label>ภาษาไทย:</label> <span className={styles.thesisTitle}>{approvedForm2?.thesis_title_th || '-'}</span></li>
        <li><label>ภาษาอังกฤษ:</label> <span className={styles.thesisTitle}>{approvedForm2?.thesis_title_en || '-'}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />

      <h4>รายละเอียดการขออนุญาต</h4>
      <div className={styles.subsection}>
        <h5>เครื่องมือที่ใช้ในการวิจัย และจำนวนหนังสือที่ต้องการ</h5>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            {researchTools.length > 0 ? (
                researchTools.map((item, index) => (
                    <li key={index}><label>{item.type}:</label> <span>{item.quantity} ฉบับ</span></li>
                ))
            ) : (
                <li>ไม่มีข้อมูล</li>
            )}
        </ul>
      </div>
    </>
  );
}

export default Form5Detail;