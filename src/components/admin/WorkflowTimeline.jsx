import React from 'react';
import styles from './WorkflowTimeline.module.css'; // ✅ 1. นำเข้า CSS ใหม่

function WorkflowTimeline({ document, advisors, user }) {

  const renderTimelineSteps = () => {
    // นี่คือตัวอย่าง Logic ง่ายๆ คุณสามารถปรับแก้ให้ซับซ้อนขึ้นตามแต่ละฟอร์มได้
    if (!document.approvers || document.approvers.length === 0) {
      return (
        <li className={styles.step}>
          <span className={styles.stepRole}>- ยังไม่มีขั้นตอนต่อไป -</span>
        </li>
      );
    }

    return document.approvers.map(approver => {
      const advisor = advisors.find(a => a.advisor_id === approver.advisor_id);
      const advisorName = advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'N/A';
      const isApproved = approver.status === 'approved';

      return (
        <li key={approver.advisor_id} className={`${styles.step} ${isApproved ? styles.approved : ''}`}>
          <span className={styles.stepRole}>{isApproved ? 'อนุมัติโดย' : 'รออนุมัติโดย'}: {approver.role}</span>
          <span className={styles.stepName}>{advisorName}</span>
        </li>
      );
    });
  };

  return (
    <div className={styles.timelineCard}>
      <h4>ขั้นตอนการดำเนินงาน</h4>
      <ul className={styles.timelineList}>
        <li className={`${styles.step} ${styles.approved}`}>
            <span className={styles.stepRole}>ยื่นเอกสาร</span>
            <span className={styles.stepName}>โดย: {user.fullname}</span>
        </li>
        {renderTimelineSteps()}
      </ul>
    </div>
  );
}
export default WorkflowTimeline;