import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../User_Page/DocumentDetailPage.module.css'; // ใช้ CSS ร่วมกัน
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// นำเข้า Component แสดงผลของนักศึกษาทั้งหมด
import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import Form4Detail from '../../components/document-details/Form4Detail';
import Form5Detail from '../../components/document-details/Form5Detail';
import Form6Detail from '../../components/document-details/Form6Detail';
import ExamResultDetail from '../../components/document-details/ExamResultDetail';

// นำเข้าการ์ดดำเนินการของ Admin
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import WorkflowTimeline from '../../components/admin/WorkflowTimeline';

// Object สำหรับจับคู่ประเภทเอกสารกับ Component ที่จะแสดงผล
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

// --- Component หลักของหน้า ---
function AdminDocumentDetailPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Logic การดึงข้อมูล (เหมือนเดิม) ---
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

  // --- Logic การจัดการเอกสาร (เหมือนเดิม) ---
  const handleAction = (action, adminComment) => {
      if (!window.confirm(`คุณต้องการ "${action}" เอกสารนี้ใช่หรือไม่?`)) return;

      // --- ✅ ส่วนที่แก้ไข ---
      // 1. ดึงข้อมูลทั้งหมดที่จำเป็นจาก State มาก่อน
      const { document, user, advisors } = docData;
      
      const pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
      const docIndex = pendingDocs.findIndex(d => d.doc_id === doc.doc_id);

      if (docIndex === -1) {
          alert("เกิดข้อผิดพลาด: ไม่พบเอกสารในรายการรอตรวจ");
          return;
      }

      const docToUpdate = { ...pendingDocs[docIndex] };
      let newStatus = docToUpdate.status;

      // 2. สร้าง Logic การอัปเดตสถานะและข้อมูลตามประเภทฟอร์ม
      if (action === 'ส่งต่อ') {
          if (document.type === 'ฟอร์ม 2') {
              newStatus = 'รออาจารย์อนุมัติ';
              
              // รวบรวมรายชื่อกรรมการทั้งหมดสำหรับฟอร์ม 2
              const committeeIds = document.committee || {};
              const committeeMembers = [
                  advisors.find(a => a.advisor_id === user.main_advisor_id),
                  advisors.find(a => a.advisor_id === user.co_advisor1_id),
                  advisors.find(a => a.advisor_id === committeeIds.chair_id),
                  advisors.find(a => a.advisor_id === committeeIds.co_advisor2_id),
                  advisors.find(a => a.advisor_id === committeeIds.member5_id)
              ].filter(Boolean); // .filter(Boolean) เพื่อกรองคนที่ไม่มีออก

              docToUpdate.approvers = committeeMembers.map(member => ({
                  advisor_id: member.advisor_id,
                  role: 'กรรมการ', // สามารถกำหนด role ที่ละเอียดกว่านี้ได้
                  status: 'pending'
              }));
          }
          // เพิ่มเงื่อนไข else if สำหรับฟอร์มอื่นๆ ที่นี่
      } else if (action === 'อนุมัติ') {
          newStatus = 'อนุมัติแล้ว';
      } else if (action === 'ส่งกลับแก้ไข') {
          newStatus = 'ส่งกลับแก้ไข';
          docToUpdate.admin_comment = adminComment;
      }

      docToUpdate.status = newStatus;
      docToUpdate.action_date = new Date().toISOString();

      // 3. บันทึกข้อมูลกลับ localStorage (ส่วนนี้เหมือนเดิม)
      const newPendingDocs = pendingDocs.filter(d => d.doc_id !== doc.doc_id);
      // **หมายเหตุ:** คุณอาจต้องเพิ่ม docToUpdate ไปยัง List อื่น เช่น 'approvedDocs'
      localStorage.setItem('localStorage_pendingDocs', JSON.stringify(newPendingDocs));
      
      alert(`ดำเนินการ "${action}" เอกสารเรียบร้อยแล้ว`);
      navigate('/admin/home');
  };

  // --- ฟังก์ชันย่อยสำหรับจัดการหน้าจอ ---
  const statusClass = (docStatus) => {
    const approved = ['อนุมัติแล้ว', 'อนุมัติ'];
    const rejected = ['ไม่อนุมัติ', 'ส่งกลับแก้ไข', 'ปฏิเสธ'];
    if (approved.includes(docStatus)) return styles.approved;
    if (rejected.includes(docStatus)) return styles.rejected;
    return styles.pending;
  };

  const formatThaiDateTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
    }) + ' น.';
  };

  if (loading) return <div className={styles.loadingText}>กำลังโหลด...</div>;
  if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;

  const { document, user, ...restData } = docData;
  const DetailComponent = detailComponentMap[document.type];

  // --- ✅✅✅ โครงสร้าง JSX ที่ปรับแก้ใหม่ทั้งหมด ✅✅✅ ---
  return (
    <main className={styles.detailContainer}>
      
      {/* --- คอลัมน์ที่ 1: เนื้อหาหลัก --- */}
      <div className={styles.documentContent}>
        <div className={styles.contentHeader}>
          <h1>{document.title}</h1>
          {/* ใช้ <Link> หรือ <button> ก็ได้ แต่ Link จะเหมาะสมกว่าถ้าปลายทางชัดเจน */}
          <Link onClick={() => navigate(-1)} className={styles.backLink}>
            <FontAwesomeIcon icon={faArrowLeft} /> กลับไปหน้ารายการ
          </Link>
        </div>
        
        <div className={styles.detailCard}>
          {DetailComponent ? (
            <DetailComponent doc={document} user={user} {...restData} />
          ) : (
            <p>ไม่มีรายละเอียดเพิ่มเติมสำหรับเอกสารประเภทนี้</p>
          )}
        </div>

        {/* แสดงการ์ดความคิดเห็นของนักศึกษา */}
        <div className={styles.detailCard}>
          <h3>ความคิดเห็น (จากผู้ยื่น)</h3>
          <p className={styles.commentBox}>{document.student_comment || 'ไม่มีความคิดเห็นเพิ่มเติม'}</p>
        </div>

        {/* เพิ่มการ์ดความคิดเห็นจากเจ้าหน้าที่ (จะแสดงเมื่อเอกสารเคยถูกตีกลับ) */}
        {document.admin_comment && (
          <div className={styles.detailCard}>
            <h3>ความคิดเห็น (จากเจ้าหน้าที่)</h3>
            <p className={styles.commentBox}>{document.admin_comment}</p>
          </div>
        )}
      </div>

      {/* --- คอลัมน์ที่ 2: แถบด้านข้าง --- */}
      <aside className={styles.documentSidebar}>
        {/* การ์ดสถานะ */}
        <div className={`${styles.statusCard} ${statusClass(document.status)}`}>
          <div className={styles.statusText}>
            <p>สถานะปัจจุบัน</p>
            <h2>{document.status}</h2>
          </div>
        </div>
        
        {/* การ์ดข้อมูลการยื่น */}
        <div className={styles.detailCard}>
            <h3>ข้อมูลการยื่น</h3>
            <ul className={styles.infoList}>
                <li><label>ประเภทเอกสาร:</label> <span>{document.type}</span></li>
                <li><label>วันที่ยื่น:</label> <span>{formatThaiDateTime(document.submitted_date)}</span></li>
                <li><label>วันที่อนุมัติ/ส่งกลับ:</label> <span>{formatThaiDateTime(document.action_date)}</span></li>
            </ul>
        </div>

          {/* ✅✅✅ ส่วนที่แก้ไข ✅✅✅ */}
          
          {/* 1. เพิ่ม Timeline เข้ามา */}
          <WorkflowTimeline document={document} advisors={docData.advisors} user={user} />

          {/* 2. เรียกใช้ Action Panel ใหม่ (จะแสดงปุ่มตามสถานะของเอกสาร) */}
          <AdminActionPanel document={document} onAction={handleAction} />

          {/* ✅✅✅ จบส่วนที่แก้ไข ✅✅✅ */}
          
          <div className={styles.detailCard}>
            <h3>ความคิดเห็น (จากผู้ยื่น)</h3>
            <p className={styles.commentBox}>{document.student_comment || 'ไม่มี'}</p>
          </div>
      </aside>
    </main>
  );
}

export default AdminDocumentDetailPage;