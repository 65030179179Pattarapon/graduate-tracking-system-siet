import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './AdvisorHomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileSignature, faUsers, faBell, faArrowRight } from '@fortawesome/free-solid-svg-icons';

function AdvisorHomePage() {
    const [advisorName, setAdvisorName] = useState('');
    const [pendingDocs, setPendingDocs] = useState([]);
    const [myAdvisees, setMyAdvisees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const advisorEmail = localStorage.getItem("current_user");
                if (!advisorEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

                // ดึงข้อมูลหลักทั้งหมดพร้อมกัน
                const [advisorsRes, studentsRes] = await Promise.all([
                    fetch('/data/advisor.json'),
                    fetch('/data/student.json')
                ]);
                const advisors = await advisorsRes.json();
                const students = await studentsRes.json();
                
                // ค้นหาข้อมูลอาจารย์ที่ล็อกอินอยู่
                const currentAdvisor = advisors.find(a => a.email.toLowerCase() === advisorEmail.toLowerCase());
                if (!currentAdvisor) throw new Error("ไม่พบข้อมูลอาจารย์");
                
                setAdvisorName(`${currentAdvisor.prefix_th}${currentAdvisor.first_name_th}`);

                // 1. ค้นหานักศึกษาในที่ปรึกษา
                const advisees = students.filter(s => 
                    s.main_advisor_id === currentAdvisor.advisor_id || 
                    s.co_advisor1_id === currentAdvisor.advisor_id
                );
                setMyAdvisees(advisees);

                // 2. ค้นหาเอกสารที่รอการอนุมัติ
                const waitingDocsList = JSON.parse(localStorage.getItem('localStorage_waitingAdvisorDocs') || '[]');
                const relevantDocs = waitingDocsList.filter(doc => 
                    doc.approvers?.some(approver => 
                        approver.advisor_id === currentAdvisor.advisor_id && approver.status === 'pending'
                    )
                );

                // เพิ่มข้อมูลชื่อนักศึกษาเข้าไปในเอกสารแต่ละฉบับ
                const docsWithStudentNames = relevantDocs.map(doc => {
                    const student = students.find(s => s.student_id === doc.student_id);
                    return {
                        ...doc,
                        studentName: student ? `${student.first_name_th} ${student.last_name_th}` : 'ไม่พบชื่อ'
                    };
                });
                
                setPendingDocs(docsWithStudentNames);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatThaiDate = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('th-TH', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1>ยินดีต้อนรับ, {advisorName}</h1>
                <p>ภาพรวมและรายการที่ต้องดำเนินการสำหรับอาจารย์ที่ปรึกษา</p>
            </header>

            <div className={styles.dashboardGrid}>
                {/* --- การ์ดภาพรวม --- */}
                <div className={`${styles.statCard} ${styles.pendingCard}`}>
                    <FontAwesomeIcon icon={faFileSignature} />
                    <div className={styles.statInfo}>
                        <span className={styles.statNumber}>{pendingDocs.length}</span>
                        <span className={styles.statLabel}>เอกสารรออนุมัติ</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.adviseeCard}`}>
                    <FontAwesomeIcon icon={faUsers} />
                    <div className={styles.statInfo}>
                        <span className={styles.statNumber}>{myAdvisees.length}</span>
                        <span className={styles.statLabel}>นักศึกษาในที่ปรึกษา</span>
                    </div>
                </div>

                {/* --- การ์ดรายการที่ต้องดำเนินการด่วน --- */}
                <div className={styles.actionCard}>
                    <h2><FontAwesomeIcon icon={faBell} /> รายการที่ต้องดำเนินการด่วน</h2>
                    <div className={styles.docList}>
                        {pendingDocs.length > 0 ? (
                            pendingDocs.map(doc => (
                                <Link to={`/advisor/docs/${doc.doc_id}`} key={doc.doc_id} className={styles.docItem}>
                                    <div className={styles.docInfo}>
                                        <span className={styles.docTitle}>{doc.title}</span>
                                        <span className={styles.docStudent}>นักศึกษา: {doc.studentName}</span>
                                    </div>
                                    <div className={styles.docMeta}>
                                        <span className={styles.docDate}>วันที่ส่ง: {formatThaiDate(doc.submitted_date)}</span>
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>🎉 ไม่มีเอกสารที่ต้องดำเนินการในขณะนี้</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- การ์ดนักศึกษาในที่ปรึกษา --- */}
                <div className={styles.adviseesCard}>
                    <h2><FontAwesomeIcon icon={faUsers} /> นักศึกษาในที่ปรึกษา</h2>
                    <ul className={styles.adviseeList}>
                        {myAdvisees.slice(0, 5).map(student => (
                            <li key={student.student_id}>
                                <Link to={`/advisor/advisee/${student.student_id}`}>
                                    {student.first_name_th} {student.last_name_th}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {myAdvisees.length > 5 && (
                         <Link to="/advisor/advisees" className={styles.viewAllButton}>
                            ดูนักศึกษาทั้งหมด ({myAdvisees.length} คน) <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                    )}
                     {myAdvisees.length === 0 && (
                        <div className={styles.emptyStateSmall}>
                            <p>ยังไม่มีนักศึกษาในที่ปรึกษา</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdvisorHomePage;