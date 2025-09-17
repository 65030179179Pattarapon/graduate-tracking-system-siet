import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../User_Page/DocumentDetailPage.module.css'; // ใช้ CSS ร่วมกัน
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHistory } from '@fortawesome/free-solid-svg-icons';

// นำเข้า Component แสดงผลของนักศึกษาทั้งหมด
import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import Form4Detail from '../../components/document-details/Form4Detail';
import Form5Detail from '../../components/document-details/Form5Detail';
import Form6Detail from '../../components/document-details/Form6Detail';
import ExamResultDetail from '../../components/document-details/ExamResultDetail';

// นำเข้าการ์ดดำเนินการของ Admin
import AdminWorkflowCard from '../../components/admin/AdminWorkflowCard';

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

  // --- ✅✅✅ แก้ไข Logic การดึงข้อมูลที่นี่ ✅✅✅ ---
  useEffect(() => {
    const loadDocumentData = async () => {
        try {
            const studentsRes = await fetch('/data/student.json');
            const students = await studentsRes.json();

            // 1. ดึงข้อมูลจาก localStorage ทุกส่วนที่เกี่ยวข้อง
            const listKeys = [
                'localStorage_pendingDocs',
                'localStorage_waitingAdvisorDocs',
                'localStorage_approvedDocs',
                'localStorage_rejectedDocs'
            ];
            let allLocalStorageDocs = [];
            listKeys.forEach(key => {
                const docs = JSON.parse(localStorage.getItem(key) || '[]');
                allLocalStorageDocs.push(...docs);
            });
            
            let allStaticDocs = [];
            students.forEach(s => { if(s.documents) allStaticDocs.push(...s.documents) });

            // 2. รวมเอกสารทั้งหมดจากทุกแหล่ง
            const allDocs = [...allStaticDocs, ...allLocalStorageDocs];
            const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.doc_id, doc])).values());

            // 3. ค้นหาเอกสารที่ต้องการจากรายการทั้งหมด
            const document = uniqueDocs.find(d => d.doc_id === docId);
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
                allUserDocs: uniqueDocs.filter(d => d.student_email === studentUser.email),
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

  // --- Logic การจัดการเอกสาร (โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง) ---
  const handleAction = (action, adminComment) => {
    if (!window.confirm(`คุณต้องการ "${action}" เอกสารนี้ใช่หรือไม่?`)) return;

    const { document, user, advisors } = docData;
    
    // --- 1. กำหนด "list" ทั้งหมดใน localStorage ---
    const listKeys = {
        pending: 'localStorage_pendingDocs',
        waitingAdvisor: 'localStorage_waitingAdvisorDocs',
        waitingCommittee: 'localStorage_waitingCommitteeDocs',
        waitingExecutive: 'localStorage_waitingExecutiveDocs',
        approved: 'localStorage_approvedDocs',
        rejected: 'localStorage_rejectedDocs'
    };

    // **สำคัญ:** แก้ไขให้ค้นหาจากทุก List ที่เป็นไปได้ ไม่ใช่แค่ pending
    let sourceListKey = null;
    let docIndex = -1;

    for (const key of Object.values(listKeys)) {
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        const index = list.findIndex(d => d.doc_id === docId);
        if (index !== -1) {
            sourceListKey = key;
            docIndex = index;
            break;
        }
    }

    if (docIndex === -1) {
        alert("เกิดข้อผิดพลาด: ไม่พบเอกสารในรายการใดๆ");
        return;
    }

    const sourceList = JSON.parse(localStorage.getItem(sourceListKey) || '[]');
    const docToUpdate = { ...sourceList[docIndex] };

    // --- 2. สร้างและอัปเดตประวัติ ---
    if (!docToUpdate.history) {
        docToUpdate.history = [{ action: 'นักศึกษายื่นเอกสาร', actor: user.fullname, date: docToUpdate.submitted_date }];
    }
    const historyEntry = {
        action: action === 'ส่งกลับแก้ไข' ? 'เจ้าหน้าที่ส่งกลับให้แก้ไข' : `เจ้าหน้าที่${action}`,
        actor: 'เจ้าหน้าที่',
        date: new Date().toISOString(),
        comment: adminComment || ''
    };
    docToUpdate.history.push(historyEntry);

    // --- 3. Logic หลัก: อัปเดตสถานะและย้ายเอกสาร ---
    let newStatus = docToUpdate.status;
    let targetListKey = sourceListKey;

    if (action === 'ส่งกลับแก้ไข') {
        newStatus = 'ส่งกลับแก้ไข';
        targetListKey = listKeys.rejected;
        docToUpdate.admin_comment = adminComment;
    } else if (action === 'อนุมัติ') {
        if (['ผลสอบภาษาอังกฤษ', 'ผลสอบวัดคุณสมบัติ'].includes(document.type)) {
            newStatus = 'อนุมัติแล้ว';
            targetListKey = listKeys.approved;
        }
    } else if (action === 'ส่งต่อ') {
        switch (document.type) {
            case 'ฟอร์ม 1':
                newStatus = 'รออาจารย์อนุมัติ';
                targetListKey = listKeys.waitingAdvisor;
                const form1Approvers = [
                    advisors.find(a => a.advisor_id === document.selected_main_advisor_id),
                    advisors.find(a => a.advisor_id === document.selected_co_advisor_id)
                ].filter(Boolean);
                docToUpdate.approvers = form1Approvers.map(adv => ({ advisor_id: adv.advisor_id, role: 'ที่ปรึกษา', status: 'pending' }));
                break;
            
            case 'ฟอร์ม 2':
            case 'ฟอร์ม 6':
                newStatus = 'รออาจารย์อนุมัติ';
                targetListKey = listKeys.waitingAdvisor;
                const form2CommitteeIds = document.committee || {};
                const form2Committee = [
                    advisors.find(a => a.advisor_id === user.main_advisor_id),
                    advisors.find(a => a.advisor_id === user.co_advisor1_id),
                    advisors.find(a => a.advisor_id === form2CommitteeIds.co_advisor2_id),
                    advisors.find(a => a.advisor_id === form2CommitteeIds.chair_id),
                    advisors.find(a => a.advisor_id === form2CommitteeIds.member5_id),
                ].filter(Boolean);
                docToUpdate.approvers = form2Committee.map(member => ({ advisor_id: member.advisor_id, role: 'กรรมการ', status: 'pending' }));
                break;

            case 'ฟอร์ม 3':
                newStatus = 'รออาจารย์อนุมัติ';
                targetListKey = listKeys.waitingAdvisor;
                const approvedForm2 = docData.allUserDocs.find(d => d.type === 'ฟอร์ม 2' && d.status === 'อนุมัติแล้ว');
                const form3CommitteeIds = approvedForm2?.committee || {};
                const form3Approvers = [
                    advisors.find(a => a.advisor_id === user.main_advisor_id),
                    advisors.find(a => a.advisor_id === user.co_advisor1_id),
                    advisors.find(a => a.advisor_id === form3CommitteeIds.co_advisor2_id),
                    advisors.find(a => a.advisor_id === form3CommitteeIds.chair_id)
                ].filter(Boolean);
                docToUpdate.approvers = form3Approvers.map(adv => ({ advisor_id: adv.advisor_id, role: 'ผู้อนุมัติ', status: 'pending' }));
                break;

            case 'ฟอร์ม 4':
            case 'ฟอร์ม 5':
                newStatus = 'รออาจารย์อนุมัติ';
                targetListKey = listKeys.waitingAdvisor;
                const form45Approver = advisors.find(a => a.advisor_id === user.main_advisor_id);
                if (form45Approver) {
                    docToUpdate.approvers = [{ advisor_id: form45Approver.advisor_id, role: 'ที่ปรึกษาหลัก', status: 'pending' }];
                }
                break;

            default:
                alert('ไม่พบ Workflow สำหรับเอกสารประเภทนี้');
                return;
        }
    }

    docToUpdate.status = newStatus;
    docToUpdate.action_date = new Date().toISOString();

    // --- 4. ย้ายเอกสารไปยัง List ที่ถูกต้อง ---
    const newSourceList = sourceList.filter(d => d.doc_id !== docId);
    localStorage.setItem(sourceListKey, JSON.stringify(newSourceList));

    if (sourceListKey !== targetListKey) {
        const targetList = JSON.parse(localStorage.getItem(targetListKey) || '[]');
        targetList.push(docToUpdate);
        localStorage.setItem(targetListKey, JSON.stringify(targetList));
    }
    
    alert(`ดำเนินการ "${action}" เอกสารเรียบร้อยแล้ว`);
    navigate('/admin/home');
};

  // --- ฟังก์ชันย่อยสำหรับจัดการหน้าจอ (โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง) ---
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
  if (error) return <div className={styles.errorText}>{error}</div>;

  const { document, user, ...restData } = docData;
  const DetailComponent = detailComponentMap[document.type];

  // --- โครงสร้าง JSX (โค้ดเดิมของคุณ ไม่มีการเปลี่ยนแปลง) ---
  return (
    <div className={styles.pageWrapper}>
        <div className={styles.pageHeader}>
        </div>
        <main className={styles.detailContainer}>
            <div className={styles.documentContent}>
                <div className={styles.contentHeader}>
                    <h1>{document.title}</h1>
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
                <div className={styles.detailCard}>
                    <h3>ความคิดเห็น (จากผู้ยื่น)</h3>
                    <p className={styles.commentBox}>{document.student_comment || 'ไม่มีความคิดเห็นเพิ่มเติม'}</p>
                </div>
                {document.admin_comment && (
                    <div className={styles.detailCard}>
                        <h3>ความคิดเห็น (จากเจ้าหน้าที่)</h3>
                        <p className={styles.commentBox}>{document.admin_comment}</p>
                    </div>
                )}
            </div>
            <aside className={styles.documentSidebar}>
                <div className={`${styles.statusCard} ${statusClass(document.status)}`}>
                    <div className={styles.statusText}>
                        <p>สถานะปัจจุบัน</p>
                        <h2>{document.status}</h2>
                    </div>
                </div>
                <div className={styles.detailCard}>
                    <h3>ข้อมูลการยื่น</h3>
                    <ul className={styles.infoList}>
                        <li><label>ประเภทเอกสาร:</label> <span>{document.type}</span></li>
                        <li><label>วันที่ยื่น:</label> <span>{formatThaiDateTime(document.submitted_date)}</span></li>
                        <li><label>วันที่อนุมัติ/ส่งกลับ:</label> <span>{formatThaiDateTime(document.action_date)}</span></li>
                    </ul>
                </div>
                <AdminWorkflowCard
                    document={document}
                    user={user}
                    advisors={docData.advisors}
                    onAction={handleAction}
                />
                <div className={styles.detailCard}>
                    <h3><FontAwesomeIcon icon={faHistory} /> ประวัติการดำเนินการ</h3>
                    <ul className={styles.historyList}>
                        {document.history && document.history.length > 0 ? (
                            document.history.map((log, index) => (
                                <li key={index}>
                                    <div className={styles.logAction}>{log.action}</div>
                                    <div className={styles.logActor}>โดย: {log.actor}</div>
                                    <div className={styles.logDate}>{formatThaiDateTime(log.date)}</div>
                                    {log.comment && <p className={styles.logComment}><b>เหตุผล:</b> {log.comment}</p>}
                                </li>
                            ))
                        ) : (
                            <li>
                                <div className={styles.logAction}>นักศึกษายื่นเอกสาร</div>
                                <div className={styles.logActor}>โดย: {user.fullname}</div>
                                <div className={styles.logDate}>{formatThaiDateTime(document.submitted_date)}</div>
                            </li>
                        )}
                    </ul>
                </div>
            </aside>
        </main>
    </div>
  );
}

export default AdminDocumentDetailPage;

