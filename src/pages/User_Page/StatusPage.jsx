import React, { useState, useEffect } from 'react';
import styles from './StatusPage.module.css';
import StatusColumn from '../../components/StatusColumn';

function StatusPage() {
  const [documents, setDocuments] = useState({ approved: [], pending: [], rejected: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStatusData = async () => {
      try {
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const response = await fetch("/data/student.json");
        const students = await response.json();
        const currentUser = students.find(s => s.email === userEmail);
        if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");

        // 1. ดึงข้อมูลเอกสารพื้นฐานจาก student.json
        const baseDocs = currentUser.documents || [];

        // --- ส่วนที่แก้ไข: ดึงข้อมูลที่เพิ่งส่งมาจาก localStorage ---
        // 2. ดึงเอกสารใหม่ที่ถูกบันทึกไว้ใน localStorage
        const newPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
        // กรองเอาเฉพาะเอกสารของ user ที่ login อยู่
        const userNewPendingDocs = newPendingDocs.filter(doc => doc.student_email === userEmail);
        
        // 3. รวมข้อมูลจากทั้งสองแหล่งเข้าด้วยกัน
        const allDocs = [...baseDocs, ...userNewPendingDocs];
        // --- จบส่วนที่แก้ไข ---


        // --- ส่วนที่เหลือทำงานเหมือนเดิม ---
        const approvedStates = ['อนุมัติแล้ว', 'อนุมัติ', 'ผ่านเกณฑ์'];
        const rejectedStates = ['ไม่อนุมัติ', 'ตีกลับ', 'ไม่ผ่านเกณฑ์'];

        const approved = allDocs.filter(doc => approvedStates.includes(doc.status));
        const rejected = allDocs.filter(doc => rejectedStates.includes(doc.status));
        const pending = allDocs.filter(doc => !approvedStates.includes(doc.status) && !rejectedStates.includes(doc.status));
        
        const sortByDate = (a, b) => new Date(b.submitted_date || 0) - new Date(a.submitted_date || 0);
        approved.sort(sortByDate);
        pending.sort(sortByDate);
        rejected.sort(sortByDate);

        setDocuments({ approved, pending, rejected });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStatusData();
  }, []);

  if (loading) return <div className={styles.loadingText}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <main className={styles.statusPageContainer}>
      <h1>📄 สถานะเอกสารของคุณ</h1>
      <div className={styles.statusGrid}>
        <StatusColumn title="✔️ อนุมัติแล้ว" statusType="approved" documents={documents.approved} />
        <StatusColumn title="⌛ กำลังดำเนินการ" statusType="pending" documents={documents.pending} />
        <StatusColumn title="❌ ไม่อนุมัติ / ต้องแก้ไข" statusType="rejected" documents={documents.rejected} />
      </div>
    </main>
  );
}

export default StatusPage;