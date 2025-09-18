import React from 'react';
import styles from '../../../pages/Admin_Page/ManageStudentDetailPage.module.css';

function CommitteeSection({ student, advisors }) {
  return (
    <div className={styles.card}>
      <h3>คณะกรรมการสอบวิทยานิพนธ์</h3>
      <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>อาจารย์ที่ปรึกษาหลัก</label>
            <select defaultValue={student.main_advisor_id || ''}>
                <option value="">-- เลือก --</option>
                {advisors.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>อาจารย์ที่ปรึกษาร่วม 1</label>
            <select defaultValue={student.co_advisor1_id || ''}>
                <option value="">-- ไม่มี --</option>
                {advisors.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>อาจารย์ที่ปรึกษาร่วม 2</label>
             <select>
                <option value="">-- ไม่มี --</option>
                {advisors.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
            </select>
          </div>
      </div>
    </div>
  );
}

export default CommitteeSection;