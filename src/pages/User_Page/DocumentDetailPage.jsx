import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './DocumentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import Form4Detail from '../../components/document-details/Form4Detail';
import Form5Detail from '../../components/document-details/Form5Detail';
import Form6Detail from '../../components/document-details/Form6Detail';
import ExamResultDetail from '../../components/document-details/ExamResultDetail'; // <-- 1. นำเข้า

const detailComponentMap = {
  'ฟอร์ม 1': Form1Detail,
  'ฟอร์ม 2': Form2Detail,
  'ฟอร์ม 3': Form3Detail,
  'ฟอร์ม 4': Form4Detail,
  'ฟอร์ม 5': Form5Detail,
  'ฟอร์ม 6': Form6Detail,
  'ผลสอบภาษาอังกฤษ': ExamResultDetail, // <-- 2. เพิ่มเข้าไปใน Map
  'ผลสอบวัดคุณสมบัติ': ExamResultDetail, // <-- 2. เพิ่มเข้าไปใน Map
};

const formatThaiDateTime = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
  }) + ' น.';
};

function DocumentDetailPage() {
  const { docId } = useParams();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocumentDetail = async () => {
      try {
        if (!docId) throw new Error("ไม่พบ ID ของเอกสารใน URL");

        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const studentsRes = await fetch("/data/student.json");
        const students = await studentsRes.json();
        const currentUser = students.find(s => s.email === userEmail);
        if(!currentUser) throw new Error("ไม่พบข้อมูลผู้ใช้ปัจจุบันในระบบ");

        const baseDocs = currentUser.documents || [];
        const newPendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]').filter(doc => doc.student_email === userEmail);
        const allUserDocuments = [...baseDocs, ...newPendingDocs];

        const document = allUserDocuments.find(doc => doc.doc_id === docId);
        if (!document) throw new Error("ไม่พบข้อมูลเอกสาร");

        const [advisors, programs, departments] = await Promise.all([
          fetch("/data/advisor.json").then(res => res.json()),
          fetch("/data/structures/programs.json").then(res => res.json()),
          fetch("/data/structures/departments.json").then(res => res.json()),
        ]);
        
        setDocData({ 
          document, 
          user: {
            ...currentUser,
            fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim()
          }, 
          advisors, 
          programs, 
          departments,
          allUserDocs: allUserDocuments
        });

      } catch (err) { // --- ✅ นี่คือจุดที่แก้ไข: ลบ "=>" ที่ไม่จำเป็นออก ---
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDocumentDetail();
  }, [docId]);

  if (loading) return <div className={styles.loadingText}>กำลังโหลดรายละเอียด...</div>;
  if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;

  const { document, user, allUserDocs, ...restData } = docData;
  const DetailComponent = detailComponentMap[document.type];

  const statusClass = (docStatus) => {
    const approved = ['อนุมัติแล้ว', 'อนุมัติ'];
    const rejected = ['ไม่อนุมัติ', 'ตีกลับ'];
    if (approved.includes(docStatus)) return styles.approved;
    if (rejected.includes(docStatus)) return styles.rejected;
    return styles.pending;
  };

  return (
    <main className={styles.detailContainer}>
      <div className={styles.documentContent}>
        <div className={styles.contentHeader}>
          <h1>{document.title}</h1>
          <Link to="/student/status" className={styles.backLink}>
            <FontAwesomeIcon icon={faArrowLeft} /> กลับหน้ารวมสถานะ
          </Link>
        </div>
        
        <div className={styles.detailCard}>
          {DetailComponent ? (
            <DetailComponent doc={document} user={user} allUserDocs={allUserDocs} {...restData} />
          ) : (
            <p>ไม่มีรายละเอียดเพิ่มเติมสำหรับเอกสารประเภทนี้</p>
          )}
        </div>

        <div className={styles.detailCard}>
          <h3> ความคิดเห็นเพิ่มเติม (จากผู้ยื่น)</h3>
          <p className={styles.commentBox}>{document.student_comment || 'ไม่มีความคิดเห็นเพิ่มเติม'}</p>
        </div>
      </div>

      <aside className={styles.documentSidebar}>
        <div className={`${styles.statusCard} ${statusClass(document.status)}`}>
            <div className={styles.statusText}>
                <p>สถานะปัจจุบัน</p>
                <h2>{document.status}</h2>
            </div>
        </div>
        <div className={styles.detailCard}>
            <h3> ข้อมูลการยื่น</h3>
            <ul className={styles.infoList}>
                <li><label>ประเภทเอกสาร:</label> <span>{document.type}</span></li>
                <li><label>วันที่ยื่น:</label> <span>{formatThaiDateTime(document.submitted_date)}</span></li>
                <li><label>วันที่อนุมัติ/ส่งกลับ:</label> <span>{formatThaiDateTime(document.action_date)}</span></li>
            </ul>
        </div>
      </aside>
    </main>
  );
}

export default DocumentDetailPage;