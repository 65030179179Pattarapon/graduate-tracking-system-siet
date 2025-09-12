import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

function ExamResultDetail({ doc, user, programs }) {
  const programName = programs.find(p => p.id === user.program_id)?.name || '-';
  const details = doc.details || {};
  const scores = details.scores || {};

  return (
    <>
      <h4>ข้อมูลผู้ยื่น</h4>
      <ul className={styles.infoList}>
        <li><label>ชื่อ-นามสกุล:</label> <span>{user.fullname}</span></li>
        <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
        <li><label>หลักสูตร:</label> <span>{programName}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />
      
      <h4>รายละเอียดผลสอบ</h4>
      <div className={styles.subsection}>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>ประเภทการสอบ:</label> <span>{details.exam_type}</span></li>
            {details.exam_date && <li><label>วันที่สอบ:</label> <span>{new Date(details.exam_date).toLocaleDateString('th-TH')}</span></li>}
            {details.result && <li><label>ผลการสอบ (QE):</label> <span>{details.result}</span></li>}
        </ul>
      </div>

      {Object.keys(scores).length > 0 && (
        <div className={styles.subsection}>
            <h5>คะแนน</h5>
            <ul className={`${styles.infoList} ${styles.compact}`}>
                {Object.entries(scores).map(([key, value]) => (
                    <li key={key}><label>{key.replace(/-/g, ' ')}:</label> <span>{value}</span></li>
                ))}
            </ul>
        </div>
      )}

      <hr className={styles.subtleDivider} />
      <h4>เอกสารแนบ</h4>
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

export default ExamResultDetail;