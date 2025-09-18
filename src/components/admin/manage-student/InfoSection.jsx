import React from 'react';
import styles from '../../../pages/Admin_Page/ManageStudentDetailPage.module.css';

function InfoSection({ student }) {
  return (
    <>
      <div className={styles.card}>
        <h3>ข้อมูลทั่วไป</h3>
        <div className={styles.formGrid}>
            <div className={styles.formGroup}><label>รหัสนักศึกษา</label><input type="text" value={student.student_id || ''} disabled /></div>
            <div className={styles.formGroup}><label>คำนำหน้า (ไทย)</label><input type="text" defaultValue={student.prefix_th || ''} /></div>
            <div className={styles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" defaultValue={student.first_name_th || ''} /></div>
            <div className={styles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" defaultValue={student.last_name_th || ''} /></div>
            <div className={styles.formGroup}><label>คำนำหน้า (อังกฤษ)</label><input type="text" defaultValue={student.prefix_en || ''} /></div>
            <div className={styles.formGroup}><label>ชื่อ (อังกฤษ)</label><input type="text" defaultValue={student.first_name_en || ''} /></div>
            <div className={styles.formGroup}><label>นามสกุล (อังกฤษ)</label><input type="text" defaultValue={student.last_name_en || ''} /></div>
            <div className={styles.formGroup}><label>อีเมล</label><input type="email" defaultValue={student.email || ''} /></div>
            <div className={styles.formGroup}><label>เบอร์โทรศัพท์</label><input type="tel" defaultValue={student.phone || ''} /></div>
        </div>
      </div>
      <div className={styles.card}>
        <h3>ข้อมูลการศึกษา</h3>
        <div className={styles.formGrid}>
            <div className={styles.formGroup}><label>ระดับการศึกษา</label><input type="text" defaultValue={student.degree || ''} /></div>
            <div className={styles.formGroup}><label>หลักสูตร</label><input type="text" defaultValue={student.program || ''} /></div>
            <div className={styles.formGroup}><label>สถานะนักศึกษา</label><input type="text" defaultValue={student.status || ''} /></div>
            <div className={styles.formGrop}><label>ปีการศึกษาที่เข้า</label><input type="text" defaultValue={student.entry_year || ''} /></div>
        </div>
      </div>
    </>
  );
}

export default InfoSection;