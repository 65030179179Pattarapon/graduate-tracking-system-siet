import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// ฟังก์ชันสำหรับหาชื่ออาจารย์จาก ID
const findAdvisorName = (id, advisors) => {
  if (!id) return '-';
  const advisor = advisors.find(a => a.advisor_id === id);
  return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่พบข้อมูล';
};

function Form6Detail({ doc, user, advisors, allUserDocs }) {

  // ค้นหาข้อมูลจาก "ฟอร์ม 2" ที่เคยอนุมัติแล้ว เพื่อนำข้อมูลมาแสดง
  const approvedForm2 = allUserDocs.find(d => d.type === 'ฟอร์ม 2' && (d.status === 'อนุมัติแล้ว' || d.status === 'อนุมัติ'));

  // ค้นหาชื่ออาจารย์ที่ปรึกษาจากโปรไฟล์ user
  const mainAdvisorName = findAdvisorName(user.main_advisor_id, advisors);
  const coAdvisor1Name = findAdvisorName(user.co_advisor1_id, advisors);

  // ค้นหาชื่อคณะกรรมการที่ถูกเลือกไว้ในฟอร์ม 6 ที่ส่งมา
  const committee = doc.committee || {};
  const chairName = findAdvisorName(committee.chair_id, advisors);
  const coAdvisor2Name = findAdvisorName(committee.co_advisor2_id, advisors);
  const member5Name = findAdvisorName(committee.member5_id, advisors);
  const reserveExternalName = findAdvisorName(committee.reserve_external_id, advisors);
  const reserveInternalName = findAdvisorName(committee.reserve_internal_id, advisors);

  // เตรียมข้อมูลที่อยู่และที่ทำงาน
  const address = user.address ? `${user.address.street}, ${user.address.city}, ${user.address.province} ${user.address.postal_code}` : '-';
  const workplace = user.workplace || '-';

  return (
    <>
      <h4><i className={styles.iconPrefix}></i>ข้อมูลผู้ยื่นคำร้อง</h4>
      <div className={styles.subsection}>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>ชื่อ-นามสกุล:</label> <span>{user.fullname}</span></li>
            <li><label>รหัสประจำตัว:</label> <span>{user.student_id}</span></li>
            <li><label>ระดับปริญญา:</label> <span>{user.degree}</span></li>
            <li><label>หลักสูตร/สาขาวิชา:</label> <span>{user.programName}</span></li>
            <li><label>ภาควิชา:</label> <span>{user.departmentName}</span></li>
            <li><label>เริ่มภาคเรียนที่:</label> <span>{`${user.admit_semester || '-'} / ${user.admit_year || '-'}`}</span></li>
            <li><label>เบอร์โทร:</label> <span>{user.phone || '-'}</span></li>
            <li><label>ที่อยู่ปัจจุบัน:</label> <span>{address}</span></li>
            <li><label>สถานที่ทำงาน:</label> <span>{workplace}</span></li>
        </ul>
      </div>

      <hr className={styles.subtleDivider} />
      
      <h4><i className={styles.iconPrefix}></i>ข้อมูลวิทยานิพนธ์</h4>
       <div className={styles.subsection}>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>ชื่อเรื่อง (ไทย):</label> <span className={styles.thesisTitle}>{approvedForm2?.thesis_title_th || '-'}</span></li>
            <li><label>ชื่อเรื่อง (อังกฤษ):</label> <span className={styles.thesisTitle}>{approvedForm2?.thesis_title_en || '-'}</span></li>
        </ul>
      </div>

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
        <h5>คณะกรรมการสอบ</h5>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>ประธานกรรมการสอบ:</label> <span>{chairName}</span></li>
            <li><label>กรรมการ (ที่ปรึกษาร่วม 2):</label> <span>{coAdvisor2Name}</span></li>
            <li><label>กรรมการสอบ (คนที่ 5):</label> <span>{member5Name}</span></li>
        </ul>
      </div>
      <div className={styles.subsection}>
        <h5>กรรมการสำรอง</h5>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>กรรมการสำรอง (จากภายนอก):</label> <span>{reserveExternalName}</span></li>
            <li><label>กรรมการสำรอง (จากภายใน):</label> <span>{reserveInternalName}</span></li>
        </ul>
      </div>
      
      <hr className={styles.subtleDivider} />
      <h4><i className={styles.iconPrefix}></i>เอกสารแนบ</h4>
      <div className={styles.subsection}>
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
      </div>
    </>
  );
}

export default Form6Detail;