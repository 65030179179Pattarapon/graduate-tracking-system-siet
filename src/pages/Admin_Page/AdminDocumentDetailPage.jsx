import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../User_Page/DocumentDetailPage.module.css'; // ใช้ CSS ร่วมกัน

// นำเข้า Component แสดงผลของนักศึกษาทั้งหมด
import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import Form4Detail from '../../components/document-details/Form4Detail';
import Form5Detail from '../../components/document-details/Form5Detail';
import Form6Detail from '../../components/document-details/Form6Detail';
import ExamResultDetail from '../../components/document-details/ExamResultDetail';

// นำเข้าการ์ดดำเนินการของ Admin
import AdminActionCard from '../../components/admin/AdminActionCard';

const detailComponentMap = {
  'ฟอร์ม 1': Form1Detail,
  'ฟอร์ม 2': Form2Detail,
  'ฟอร์ม 3': Form3Detail,
  'ฟอร์ม 4': Form4Detail,
  'ฟอร์ม 5': Form5Detail,
  'ฟอร์ม 6': Form6Detail,
  'ผลสอบภาษาอังกฤษ': ExamResultDetail,
  'ผลสอบวัดคุณสมบัติ': ExamResultDetail,
};

function AdminDocumentDetailPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocumentData = async () => {
        try {
            const studentsRes = await fetch('/data/student.json');
            const students = await studentsRes.json();
            const pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
            
            let allDocs = [];
            students.forEach(s => { if(s.documents) allDocs.push(...s.documents) });
            allDocs = [...allDocs, ...pendingDocs];

            const document = allDocs.find(d => d.doc_id === docId);
            if (!document) throw new Error("ไม่พบเอกสาร");
            
            const studentUser = students.find(s => s.email === document.student_email);
            if (!studentUser) throw new Error("ไม่พบข้อมูลนักศึกษาเจ้าของเอกสาร");

            const [advisors, programs, departments] = await Promise.all([
                fetch("/data/advisor.json").then(res => res.json()),
                fetch("/data/structures/programs.json").then(res => res.json()),
                fetch("/data/structures/departments.json").then(res => res.json()),
            ]);

            setDocData({
                document,
                user: { ...studentUser, fullname: `${studentUser.prefix_th} ${studentUser.first_name_th} ${studentUser.last_name_th}`.trim() },
                allUserDocs: allDocs.filter(d => d.student_email === studentUser.email),
                advisors, programs, departments
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    loadDocumentData();
  }, [docId]);

  const handleAction = (action, adminComment) => {
    alert(`ดำเนินการ: ${action}\nความคิดเห็น: ${adminComment}\n(จำลองการทำงาน)`);
    // ในอนาคต: อัปเดตสถานะใน localStorage และฐานข้อมูล
    navigate('/admin/home');
  };

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;

  const { document, user, ...restData } = docData;
  const DetailComponent = detailComponentMap[document.type];

  return (
    <main className={styles.detailContainer}>
      <div className={styles.documentContent}>
        <div className={styles.contentHeader}>
          <h1>{document.title}</h1>
        </div>
        <div className={styles.detailCard}>
          {DetailComponent ? (
            <DetailComponent doc={document} user={user} {...restData} />
          ) : (
            <p>ไม่มี Component สำหรับแสดงผลเอกสารประเภทนี้</p>
          )}
        </div>
      </div>
      <aside className={styles.documentSidebar}>
        <AdminActionCard onAction={handleAction} />
        <div className={styles.detailCard}>
             <h3>ความคิดเห็น (จากผู้ยื่น)</h3>
             <p className={styles.commentBox}>{document.student_comment || 'ไม่มี'}</p>
        </div>
      </aside>
    </main>
  );
}

export default AdminDocumentDetailPage;