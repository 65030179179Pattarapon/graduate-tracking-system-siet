import React from 'react';
import styles from './AdminWorkflowCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClock, faListCheck } from '@fortawesome/free-solid-svg-icons';

function AdminWorkflowCard({ document, user, advisors, onAction }) {
  
  // --- ส่วนแสดงผล Timeline (อัปเกรด Logic) ---
  const renderTimelineSteps = () => {
    let steps = [
      { title: 'ยื่นเอกสาร', actor: `โดย: ${user.email}`, isCompleted: true },
    ];

    // สร้าง Workflow ตามประเภทของฟอร์ม
    switch (document.type) {
      case 'ฟอร์ม 1':
        steps.push(
          { title: 'อ.ที่ปรึกษาอนุมัติ', isCompleted: ['รอผู้บริหารอนุมัติ', 'รอเจ้าหน้าที่ยืนยัน', 'อนุมัติแล้ว'].includes(document.status) },
          { title: 'ผู้บริหารอนุมัติ', isCompleted: ['รอเจ้าหน้าที่ยืนยัน', 'อนุมัติแล้ว'].includes(document.status) },
          { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: document.status === 'อนุมัติแล้ว' },
          { title: 'เสร็จสิ้น', isCompleted: document.status === 'อนุมัติแล้ว' }
        );
        break;
      case 'ฟอร์ม 2':
      case 'ฟอร์ม 6':
        steps.push(
          { title: 'อ.ที่ปรึกษา (3 ท่าน) อนุมัติ', isCompleted: ['รอคณะกรรมการสอบอนุมัติ', 'รออาจารย์ภายนอกอนุมัติ', 'รอผู้บริหารอนุมัติ', 'อนุมัติแล้ว'].includes(document.status) },
          { title: 'คณะกรรมการสอบอนุมัติ', isCompleted: ['รออาจารย์ภายนอกอนุมัติ', 'รอผู้บริหารอนุมัติ', 'อนุมัติแล้ว'].includes(document.status) },
          { title: 'อาจารย์ภายนอกอนุมัติ', isCompleted: ['รอผู้บริหารอนุมัติ', 'อนุมัติแล้ว'].includes(document.status) },
          { title: 'ผู้บริหารอนุมัติ', isCompleted: document.status === 'อนุมัติแล้ว' },
          { title: 'เสร็จสิ้น', isCompleted: document.status === 'อนุมัติแล้ว' }
        );
        break;
      case 'ฟอร์ม 3':
        steps.push(
          { title: 'อ.ที่ปรึกษา (3 ท่าน) อนุมัติ', isCompleted: ['รอประธานสอบอนุมัติ', 'อนุมัติแล้ว'].includes(document.status) },
          { title: 'ประธานกรรมการสอบอนุมัติ', isCompleted: document.status === 'อนุมัติแล้ว' },
          { title: 'เสร็จสิ้น', isCompleted: document.status === 'อนุมัติแล้ว' }
        );
        break;
      case 'ฟอร์ม 4':
      case 'ฟอร์ม 5':
        steps.push(
          { title: 'อ.ที่ปรึกษาหลักอนุมัติ', isCompleted: ['รอเจ้าหน้าที่ยืนยัน', 'อนุมัติแล้ว'].includes(document.status) },
          { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: document.status === 'อนุมัติแล้ว' },
          { title: 'เสร็จสิ้น', isCompleted: document.status === 'อนุมัติแล้ว' }
        );
        break;
      case 'ผลสอบภาษาอังกฤษ':
      case 'ผลสอบวัดคุณสมบัติ':
        steps.push(
          { title: 'เสร็จสิ้น', isCompleted: document.status === 'อนุมัติแล้ว' }
        );
        break;
      default:
        steps.push({ title: 'รอดำเนินการ', isCompleted: false });
    }

    return steps.map((step, index) => (
      <li key={index} className={`${styles.step} ${step.isCompleted ? styles.completed : ''}`}>
        <div className={styles.icon}>
          <FontAwesomeIcon icon={step.isCompleted ? faCheck : faClock} />
        </div>
        <div className={styles.details}>
          <span className={styles.title}>{step.title}</span>
          {step.actor && <span className={styles.actor}>{step.actor}</span>}
        </div>
      </li>
    ));
  };

  // --- ส่วนแสดงผล Action (อัปเกรด Logic) ---
  const renderActions = () => {
    if (document.status !== 'รอตรวจ') {
      return (
        <div className={styles.actionBody}>
          <p className={styles.waitingInfo}>
            {document.status === 'รออาจารย์อนุมัติ' ? `กำลังรอการอนุมัติ...` : 'เอกสารนี้ดำเนินการเสร็จสิ้นแล้ว'}
          </p>
        </div>
      );
    }
    
    // --- ✅✅✅ ส่วนแก้ไขหลัก ✅✅✅ ---
    // ตรวจสอบว่าเป็นฟอร์มผลสอบหรือไม่
    const isExamForm = ['ผลสอบภาษาอังกฤษ', 'ผลสอบวัดคุณสมบัติ'].includes(document.type);

    if (isExamForm) {
      // ถ้าเป็นฟอร์มผลสอบ ให้แสดงปุ่ม "อนุมัติ"
      return (
        <div className={styles.actionBody}>
          <p className={styles.nextStepInfo}>
            <b>ขั้นตอนต่อไป:</b> ตรวจสอบและยืนยันผลการสอบ
          </p>
          <div className={styles.actionButtons}>
            <button onClick={() => onAction('ส่งกลับแก้ไข', prompt("กรุณาใส่เหตุผล:"))} className={styles.dangerButton}>ส่งกลับแก้ไข</button>
            <button onClick={() => onAction('อนุมัติ')} className={styles.successButton}>อนุมัติ</button>
          </div>
        </div>
      );
    }

    // ถ้าเป็นฟอร์มอื่นๆ (ฟอร์ม 1-6) ให้แสดงปุ่ม "ส่งต่อ"
    let nextStepDetails = null;
    if (document.type === 'ฟอร์ม 1') {
        const mainAdvisor = advisors.find(a => a.advisor_id === document.selected_main_advisor_id);
        const coAdvisor = advisors.find(a => a.advisor_id === document.selected_co_advisor_id);
        nextStepDetails = (
            <div className={styles.actorList}>
                <ul>
                    {mainAdvisor && <li><b>ที่ปรึกษาหลัก:</b> {`${mainAdvisor.prefix_th}${mainAdvisor.first_name_th} ${mainAdvisor.last_name_th}`.trim()} ({mainAdvisor.email})</li>}
                    {coAdvisor && <li><b>ที่ปรึกษาร่วม:</b> {`${coAdvisor.prefix_th}${coAdvisor.first_name_th} ${coAdvisor.last_name_th}`.trim()} ({coAdvisor.email})</li>}
                </ul>
            </div>
        );
    }
    // (สามารถเพิ่ม Logic การแสดงรายละเอียดผู้รับสำหรับฟอร์มอื่นๆ ได้ที่นี่)

    return (
      <div className={styles.actionBody}>
        <p className={styles.nextStepInfo}>
          ขั้นตอนต่อไป: ส่งต่อให้ผู้เกี่ยวข้องอนุมัติ
        </p>
        {nextStepDetails}
        <div className={styles.actionButtons}>
          {/* ย้ายปุ่ม "ส่งกลับให้แก้ไข" ขึ้นมาเป็นอันแรก */}
          <button 
            onClick={() => {
                const reason = prompt("กรุณาใส่เหตุผลในการส่งกลับ (ถ้ามี):");
                if (reason !== null) { onAction('ส่งกลับแก้ไข', reason); }
            }} 
            className={styles.dangerButton}
          >
            ส่งกลับให้แก้ไข
          </button>
          <button onClick={() => onAction('ส่งต่อ')} className={styles.primaryButton}>ส่งต่อ</button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.header}>
        <FontAwesomeIcon icon={faListCheck} /> ดำเนินการและสถานะ Workflow
      </h3>
      <div className={styles.timelineWrapper}>
        <ul className={styles.timeline}>
          {renderTimelineSteps()}
        </ul>
      </div>
      <hr className={styles.divider} />
      {renderActions()}
    </div>
  );
}

export default AdminWorkflowCard;