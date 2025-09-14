import React, { useState, useEffect } from 'react'; // <--- แก้ไขบรรทัดนี้
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

// --- Card Components ---
function StatusSummaryCard({ counts }) {
  return (
    <div className={styles.dashboardCard}>
      <h3>ภาพรวมเอกสาร</h3>
      <div className={styles.statusBoxes}>
        <div className={`${styles.box} ${styles.pending}`}><span>กำลังดำเนินการ</span><strong>{counts.pending}</strong></div>
        <div className={`${styles.box} ${styles.rejected}`}><span>ตีกลับ</span><strong>{counts.rejected}</strong></div>
        <div className={`${styles.box} ${styles.approved}`}><span>อนุมัติ</span><strong>{counts.approved}</strong></div>
      </div>
      <Link to="/student/status" className={styles.viewAllLink}>ดูสถานะเอกสารทั้งหมด →</Link>
    </div>
  );
}
function QuickLinksCard() {
  return (
    <div className={styles.dashboardCard}>
      <h3>ทางลัด (Quick Links)</h3>
      <div className={styles.quickLinks}>
        <Link to="/student/form1" className={styles.quickLinkBtn}>ยื่นขอที่ปรึกษา (ฟอร์ม 1)</Link>
        <Link to="/student/form2" className={styles.quickLinkBtn}>ยื่นเสนอหัวข้อ (ฟอร์ม 2)</Link>
        <Link to="/student/eng" className={styles.quickLinkBtn}>ยื่นผลสอบอังกฤษ</Link>
        <Link to="/student/templates" className={styles.quickLinkBtn}>ดาวน์โหลดเทมเพลต</Link>
      </div>
    </div>
  );
}
function NextStepCard({ approvedDocs, rejectedDocs }) {
  let nextStepContent = null;
  if (rejectedDocs.length > 0) {
    nextStepContent = (
      <div className={`${styles.nextStepBody} ${styles.alert}`}>
        <span className={styles.actionTitle}>⚠️ มีเอกสารที่ต้องแก้ไข</span>
        <p>ระบบพบว่าคุณมีเอกสารที่ถูกส่งกลับ ({rejectedDocs.length} รายการ)</p>
        <Link to="/student/status" className={styles.actionButton}>ไปที่หน้าสถานะเอกสาร</Link>
      </div>
    );
  } else {
    const hasApproved = (formType) => approvedDocs.some(doc => doc.type === formType);
    if (!hasApproved('ฟอร์ม 1')) {
      nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>เลือกอาจารย์ที่ปรึกษา</span><p>ขั้นตอนแรกคือการยื่นแบบฟอร์มเพื่อขอรับรองการเป็นอาจารย์ที่ปรึกษา</p><Link to="/student/form1" className={styles.actionButton}>ไปที่ฟอร์ม 1</Link></div>;
    } else if (!hasApproved('ฟอร์ม 2')) {
       nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>เสนอหัวข้อวิทยานิพนธ์</span><p>ขั้นตอนต่อไปคือการเสนอหัวข้อและเค้าโครงวิทยานิพนธ์</p><Link to="/student/form2" className={styles.actionButton}>ไปที่ฟอร์ม 2</Link></div>;
    } 
    else {
      nextStepContent = (
        <div className={`${styles.nextStepBody} ${styles.done}`}>
          <span className={styles.actionTitle}>👍 ยอดเยี่ยม!</span>
          <p>คุณได้ดำเนินการในขั้นตอนสำคัญครบถ้วนแล้ว</p>
          <Link to="/student/status" className={styles.actionButton}>ดูสถานะเอกสารทั้งหมด</Link>
        </div>
      );
    }
  }
  return (
    <div className={styles.dashboardCard}>
      <h3>ขั้นตอนต่อไปของคุณ (Next Step)</h3>
      {nextStepContent}
    </div>
  );
}

function RecentActivitiesCard({ documents }) {
  return (
    <div className={styles.dashboardCard}>
      <h3>รายการล่าสุด (Recent Activities)</h3>
      <ul className={styles.recentDocsList}>
        {documents.length > 0 ? (
          documents.slice(0, 5).map((doc, index) => (
            <li key={doc.doc_id || index}> {/* ใช้ doc_id เป็น key */}
              {/* --- ส่วนที่แก้ไข: ใช้ doc.doc_id --- */}
              <Link to={`/student/docs/${doc.doc_id}`} className={styles.docTitle}>{doc.title}</Link>
              <span className={`${styles.docStatus} ${styles['status-' + doc.status]}`}>{doc.status}</span>
            </li>
          ))
        ) : (
          <li className={styles.noDocs}>ยังไม่มีประวัติการยื่นเอกสาร</li>
        )}
      </ul>
    </div>
  );
}
// --- Main HomePage Component ---
function HomePage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const response = await fetch("/data/student.json");
        const students = await response.json();
        
        const currentUser = students.find(s => s.email === userEmail);
        if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");
        
        const baseDocs = currentUser.documents || [];
        const newPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]').filter(doc => doc.student_email === userEmail);
        const allDocuments = [...baseDocs, ...newPendingDocs];
        
        const approvedStates = ['อนุมัติแล้ว', 'อนุมัติ', 'ผ่านเกณฑ์'];
        const rejectedStates = ['ไม่อนุมัติ', 'ตีกลับ', 'ไม่ผ่านเกณฑ์'];

        const approvedDocs = allDocuments.filter(doc => approvedStates.includes(doc.status));
        const rejectedDocs = allDocuments.filter(doc => rejectedStates.includes(doc.status));
        const pendingDocs = allDocuments.filter(doc => !approvedStates.includes(doc.status) && !rejectedStates.includes(doc.status));
        
        allDocuments.sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date));

        setDashboardData({
          name: `${currentUser.first_name_th} ${currentUser.last_name_th}`,
          counts: {
            pending: pendingDocs.length,
            approved: approvedDocs.length,
            rejected: rejectedDocs.length,
          },
          approvedDocs: approvedDocs,
          rejectedDocs: rejectedDocs,
          allDocuments: allDocuments,
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className={styles.loading}>กำลังโหลดข้อมูลแดชบอร์ด...</div>;
  }
  if (error) {
    return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>ยินดีต้อนรับ, {dashboardData.name}!</h1>
        <p>ภาพรวมความคืบหน้าและสิ่งที่ต้องดำเนินการสำหรับคุณ</p>
      </div>
      <div className={styles.dashboardLayout}>
        <div className={styles.mainColumn}>
          <NextStepCard 
            approvedDocs={dashboardData.approvedDocs} 
            rejectedDocs={dashboardData.rejectedDocs} 
          />
          <RecentActivitiesCard documents={dashboardData.allDocuments} />
        </div>
        <div className={styles.sideColumn}>
          <StatusSummaryCard counts={dashboardData.counts} />
          <QuickLinksCard />
        </div>
      </div>
    </div>
  );
}

export default HomePage;