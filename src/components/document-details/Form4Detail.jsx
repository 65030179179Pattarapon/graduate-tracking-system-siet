import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// ฟังก์ชันสำหรับแปลงวันที่
const formatSimpleDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Form4Detail({ doc, user, programs, departments, allUserDocs, advisors }) { // <-- เพิ่ม advisors เข้ามาใน props
  const programName = programs.find(p => p.id === user.program_id)?.name || '-';
  const departmentName = departments.find(d => d.id === user.department_id)?.name || '-';

  const approvedForm2 = allUserDocs.find(d => d.type === 'ฟอร์ม 2' && (d.status === 'อนุมัติแล้ว' || d.status === 'อนุมัติ'));

  const details = doc.details || {};
  const documentTypes = details.document_types || [];
  const evaluators = details.evaluators || [];

  // --- ✅ ส่วนที่เพิ่มเข้ามา: ค้นหาข้อมูลอาจารย์ที่ปรึกษาหลัก ---
  const mainAdvisor = advisors.find(a => a.advisor_id === user.main_advisor_id);
  // --- จบส่วนที่เพิ่มเข้ามา ---

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
      
      {/* --- ✅ ส่วนที่เพิ่มเข้ามา: แสดงข้อมูลอาจารย์ที่ปรึกษาหลัก --- */}
      <hr className={styles.subtleDivider} />
      <h4>ข้อมูลอาจารย์ที่ปรึกษาหลัก</h4>
      <div className={styles.subsection}>
        {mainAdvisor ? (
            <ul className={`${styles.infoList} ${styles.compact}`}>
                <li><label>ชื่อ-นามสกุล:</label> <span>{`${mainAdvisor.prefix_th}${mainAdvisor.first_name_th} ${mainAdvisor.last_name_th}`.trim()}</span></li>
                <li><label>อีเมล:</label> <span>{mainAdvisor.contact_email}</span></li>
                <li><label>เบอร์โทรศัพท์:</label> <span>{mainAdvisor.phone}</span></li>
            </ul>
        ) : (
            <p>ไม่มีข้อมูลอาจารย์ที่ปรึกษาหลัก</p>
        )}
      </div>
      {/* --- จบส่วนที่เพิ่มเข้ามา --- */}

      <hr className={styles.subtleDivider} />

      <h4>รายละเอียดการขอเชิญ</h4>
      <div className={styles.subsection}>
        <h5>ประเภทเครื่องมือที่ต้องการประเมิน</h5>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            {documentTypes.length > 0 ? (
                documentTypes.map((item, index) => (
                    <li key={index}><label>{item.type}:</label> <span>{item.quantity} ฉบับ</span></li>
                ))
            ) : (
                <li>ไม่มีข้อมูล</li>
            )}
        </ul>
      </div>
      <div className={styles.subsection}>
        <h5>รายชื่อผู้ทรงคุณวุฒิที่เสนอเชิญ</h5>
        {evaluators.length > 0 ? (
            evaluators.map((evaluator, index) => (
                <div key={index} className={styles.evaluatorDetailCard}>
                    <h6>ผู้ทรงคุณวุฒิคนที่ {index + 1}</h6>
                    <ul className={`${styles.infoList} ${styles.compact}`}>
                        <li><label>คำนำหน้า/ยศ/ตำแหน่ง:</label> <span>{evaluator.prefix}</span></li>
                        <li><label>ชื่อ-สกุล:</label> <span>{`${evaluator.firstName} ${evaluator.lastName}`}</span></li>
                        <li><label>สถาบัน/หน่วยงาน:</label> <span>{evaluator.affiliation}</span></li>
                        <li><label>เบอร์โทรศัพท์:</label> <span>{evaluator.phone}</span></li>
                        <li><label>อีเมล:</label> <span>{evaluator.email}</span></li>
                    </ul>
                </div>
            ))
        ) : (
            <p>ไม่มีข้อมูล</p>
        )}
      </div>
    </>
  );
}

export default Form4Detail;