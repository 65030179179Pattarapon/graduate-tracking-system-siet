import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminHomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PaginationControls from '../../components/admin/PaginationControls'; // 1. นำเข้า PaginationControls
import { faInbox, faCheckCircle, } from '@fortawesome/free-solid-svg-icons';

// --- Component ย่อยสำหรับ Dashboard (ไม่มีการเปลี่ยนแปลง) ---


// --- ✅ Component ย่อยสำหรับ "เอกสารรอตรวจ" (ฉบับแก้ไข) ---
const PendingReviewSection = ({ pendingDocs, stats }) => { // เพิ่ม props stats
    const [filterBy, setFilterBy] = useState('title'); // ค่าเริ่มต้น: กรองจากชื่อเอกสาร
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDocs, setFilteredDocs] = useState(pendingDocs);
    const [sortConfig, setSortConfig] = useState({ key: 'submitted_date', order: 'desc' });

    const navigate = useNavigate();

    // --- ✅ 2. เพิ่ม Logic การจัดเรียงข้อมูล ---
    const sortedAndFilteredDocs = React.useMemo(() => {
    let sortableDocs = [...filteredDocs]; // สร้าง copy ของข้อมูลที่กรองแล้ว

    if (sortConfig.key) {
        sortableDocs.sort((a, b) => {
        // ทำให้การเปรียบเทียบไม่ case-sensitive
        const valA = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
        const valB = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];

        if (valA < valB) {
            return sortConfig.order === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
            return sortConfig.order === 'asc' ? 1 : -1;
        }
        return 0;
        });
    }
    return sortableDocs;
    }, [filteredDocs, sortConfig]); // ให้ Logic นี้ทำงานใหม่เมื่อข้อมูลที่กรองหรือเงื่อนไขการเรียงเปลี่ยน

    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 10; // กำหนดให้แสดง 10 รายการต่อหน้า

      // --- ⚙️ 2. ใช้ useEffect เพื่อกรองข้อมูลเมื่อเงื่อนไขเปลี่ยน ---
    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        
        const results = pendingDocs.filter(doc => {
        if (!searchTerm) return true; // ถ้าไม่มีคำค้นหา ให้แสดงทั้งหมด

        // ดึงค่าจาก object ของเอกสารตามหัวข้อที่เลือก
        const valueToFilter = doc[filterBy] ? String(doc[filterBy]).toLowerCase() : '';
        
        return valueToFilter.includes(lowercasedSearchTerm);
        });

        setFilteredDocs(results);
        setCurrentPage(1); // กลับไปหน้า 1 ทุกครั้งที่มีการกรองใหม่
    }, [searchTerm, filterBy, pendingDocs]);

    const requestSort = (key) => {
    let order = 'asc';
    // ถ้าคลิกซ้ำที่หัวข้อเดิม
    if (sortConfig.key === key && sortConfig.order === 'asc') {
        order = 'desc';
    } 
    // ถ้าคลิกซ้ำอีกครั้ง (จาก desc) ให้กลับไปสถานะเริ่มต้น (ไม่เรียง)
    else if (sortConfig.key === key && sortConfig.order === 'desc') {
        // กลับไปเรียงตามวันที่ส่งเป็นค่าเริ่มต้น
        key = 'submitted_date';
        order = 'desc';
    }
    setSortConfig({ key, order });
    };

    // --- ✅ 4. แก้ไข Logic การแบ่งหน้าให้ใช้ข้อมูลที่จัดเรียงแล้ว ---
    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    // ใช้ sortedAndFilteredDocs แทน filteredDocs
    const currentDocs = sortedAndFilteredDocs.slice(indexOfFirstDoc, indexOfLastDoc);
    const totalPages = Math.ceil(sortedAndFilteredDocs.length / docsPerPage);

    const handleRowClick = (docId) => {
        navigate(`/admin/docs/${docId}`);
    };

    return (
        <section className={styles.contentSection}>
            <h1><FontAwesomeIcon icon={faInbox} /> เอกสารรอตรวจ</h1>
            
            {/* --- ✅ เพิ่มการ์ดสถิติเข้ามาในหน้านี้ --- */}
            <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                    <p className={styles.statTitle}>เอกสารรอตรวจทั้งหมด</p>
                    <h2 className={styles.statValue}>{stats.pendingAdmin}</h2>
                </div>
                <div className={styles.statCard}>
                    <p className={styles.statTitle}>เอกสารในระบบทั้งหมด</p>
                    <h2 className={styles.statValue}>{stats.totalDocs}</h2>
                </div>
            </div>
            {/* --- จบส่วนการ์ดสถิติ --- */}
            
            <div className={styles.tableCard}>
                {/* --- ✅ 4. เพิ่ม JSX สำหรับฟอร์มควบคุมการกรอง --- */}
                <div className={styles.filterContainer}>
                    <select 
                        value={filterBy} 
                        onChange={e => setFilterBy(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="title">ชื่อเอกสาร</option>
                        <option value="doc_id">รหัสเอกสาร</option>
                        <option value="student_id">รหัสนักศึกษา</option>
                        <option value="studentName">ชื่อ-นามสกุล</option>
                        <option value="student_email">อีเมล</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder={`ค้นหาจาก ${filterBy}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.filterInput}
                    />
                    </div>
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                            <th onClick={() => requestSort('doc_id')}>รหัสเอกสาร </th>
                            <th onClick={() => requestSort('title')}>ชื่อเอกสาร </th>
                            <th onClick={() => requestSort('student_email')}>อีเมล </th>
                            <th onClick={() => requestSort('student_id')}>รหัสนักศึกษา </th>
                            <th onClick={() => requestSort('studentName')}>ชื่อ-นามสกุล </th>
                            <th onClick={() => requestSort('submitted_date')}>วันที่ส่ง </th>
                            <th>สถานะ</th> {/* สถานะมักจะไม่ทำการ sort */}
                            </tr>
                        </thead>
                        <tbody>
                            {currentDocs.length > 0 ? currentDocs.map(doc => (
                                <tr key={doc.doc_id} className={styles.clickableRow} onClick={() => navigate(`/admin/document/${doc.doc_id}`)}>
                                    <td>{doc.doc_id}</td>
                                    <td>{doc.title}</td>
                                    <td>{doc.student_email}</td>
                                    <td>{doc.student_id}</td>
                                    <td>{doc.studentName}</td>
                                    <td>{new Date(doc.submitted_date).toLocaleDateString('th-TH')}</td>
                                    <td>
                                    <span className={`${styles.status} ${styles[doc.status.toLowerCase()]}`}>
                                        {doc.status}
                                    </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        ไม่มีเอกสารรอตรวจในขณะนี้
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <PaginationControls 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                    />
                )}
            </div>
        </section>
    );
};

// --- Component หลัก (แก้ไข State และการแสดงผล) ---
function AdminHomePage() {
  const [stats, setStats] = useState({ pendingAdmin: 0, totalDocs: 0 });
  const [pendingDocs, setPendingDocs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('pending-review'); // ตั้งค่าเริ่มต้นให้เป็นหน้า "เอกสารรอตรวจ"

  useEffect(() => {
    const loadAdminData = async () => {
        try {
            const studentsRes = await fetch("/data/student.json");
            const students = await studentsRes.json();
            const pendingDocuments = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
            
            let allDocsCount = pendingDocuments.length;
            students.forEach(s => {
                if(s.documents) allDocsCount += s.documents.length;
            });

            setStats({
                pendingAdmin: pendingDocuments.length,
                totalDocs: allDocsCount,
            });

            const formattedPendingDocs = pendingDocuments
                .sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date))
                .map(doc => {
                    const student = students.find(s => s.email === doc.student_email);
                    return { ...doc, studentName: student ? `${student.first_name_th} ${student.last_name_th}`.trim() : 'N/A' };
                });
            
            setPendingDocs(formattedPendingDocs);

            setActivities([
                { type: 'approved', icon: faCheckCircle, text: 'คุณอนุมัติเอกสาร "ฟอร์ม 2"', time: '10 นาทีที่แล้ว' }
            ]);

        } catch (error) {
            console.error("Failed to load admin data:", error);
        } finally {
            setLoading(false);
        }
    };
    loadAdminData();
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        // ไม่ได้ใช้แล้ว แต่เก็บไว้เผื่ออนาคต
        const latestDocs = pendingDocs.slice(0, 5);
        return <DashboardSection stats={stats} latestDocs={latestDocs} activities={activities} />;
      case 'pending-review':
        // ส่ง props stats เข้าไปด้วย
        return <PendingReviewSection pendingDocs={pendingDocs} stats={stats} />;
      default:
        return <PendingReviewSection pendingDocs={pendingDocs} stats={stats} />;
    }
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div>
      {/* ส่วนนี้จะทำงานร่วมกับ State ที่ส่งมาจาก AdminLayout.jsx */}
      {renderSection()}
    </div>
  );
}

export default AdminHomePage;