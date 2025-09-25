import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 1. Import useNavigate
import styles from './StatusPage.module.css';
import StatusColumn from '../../components/StatusColumn';

function StatusPage() {
  const [documents, setDocuments] = useState({ approved: [], pending: [], rejected: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ✅ 2. สร้าง navigate function

  useEffect(() => {
    const loadStatusData = async () => {
      try {
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const response = await fetch("/data/student.json");
        const students = await response.json();
        const currentUser = students.find(s => s.email === userEmail);
        if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");

        const baseDocs = currentUser.documents || [];

        const pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
        const approvedDocs = JSON.parse(localStorage.getItem('localStorage_approvedDocs') || '[]');
        const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
        const waitingAdvisorDocs = JSON.parse(localStorage.getItem('localStorage_waitingAdvisorDocs') || '[]');
        
        const allLocalStorageDocs = [
            ...pendingDocs, 
            ...approvedDocs, 
            ...rejectedDocs, 
            ...waitingAdvisorDocs
        ];
        
        const userLocalStorageDocs = allLocalStorageDocs.filter(doc => doc.student_email === userEmail);
        
        const allDocs = [...baseDocs, ...userLocalStorageDocs];

        const approvedStates = ['อนุมัติแล้ว', 'อนุมัติ', 'ผ่านเกณฑ์'];
        const rejectedStates = ['ไม่อนุมัติ', 'ตีกลับ', 'ส่งกลับแก้ไข', 'ไม่ผ่านเกณฑ์'];

        const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.doc_id, doc])).values());

        const approved = uniqueDocs.filter(doc => approvedStates.includes(doc.status));
        const rejected = uniqueDocs.filter(doc => rejectedStates.includes(doc.status));
        const pending = uniqueDocs.filter(doc => !approvedStates.includes(doc.status) && !rejectedStates.includes(doc.status));
        
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
        {/* ✅ 3. ส่ง navigate function ไปยัง StatusColumn */}
        <StatusColumn 
            title="❌ ไม่อนุมัติ / ต้องแก้ไข" 
            statusType="rejected" 
            documents={documents.rejected} 
            navigate={navigate}
        />
        <StatusColumn 
            title="⌛ กำลังดำเนินการ" 
            statusType="pending" 
            documents={documents.pending} 
            navigate={navigate}
        />
        <StatusColumn 
            title="✔️ อนุมัติแล้ว" 
            statusType="approved" 
            documents={documents.approved} 
            navigate={navigate}
        />
      </div>
    </main>
  );
}

export default StatusPage;