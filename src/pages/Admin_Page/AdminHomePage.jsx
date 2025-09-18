import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styles from './AdminHomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PaginationControls from '../../components/admin/PaginationControls';
import { faInbox, faUserTie, faUserSecret, faUserShield, faFolderOpen, faFileCircleCheck, faFileCircleXmark, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';

// --- Component ตารางที่สามารถใช้ซ้ำได้ ---
const DocumentTable = ({ documents, headers, navigate }) => {
    const [filterBy, setFilterBy] = useState(headers.find(h => h.filterable)?.key || 'title');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'submitted_date', order: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 10;

    const filteredDocs = useMemo(() => {
        if (!searchTerm) return documents;
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return documents.filter(doc => {
            const value = doc[filterBy];
            if (headers.find(h => h.key === filterBy)?.isDate) {
                const formattedDate = new Date(value || 0).toLocaleDateString('th-TH');
                return formattedDate.includes(lowercasedSearchTerm);
            }
            const valueToFilter = value ? String(value).toLowerCase() : '';
            return valueToFilter.includes(lowercasedSearchTerm);
        });
    }, [documents, searchTerm, filterBy, headers]);

    const sortedDocs = useMemo(() => {
        let sortableDocs = [...filteredDocs];
        if (sortConfig.key) {
            sortableDocs.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableDocs;
    }, [filteredDocs, sortConfig]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterBy, documents]);

    const requestSort = (key) => {
        let order = 'asc';
        if (sortConfig.key === key && sortConfig.order === 'asc') order = 'desc';
        setSortConfig({ key, order });
    };

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocs = sortedDocs.slice(indexOfFirstDoc, indexOfLastDoc);
    const totalPages = Math.ceil(sortedDocs.length / docsPerPage);

    return (
        <div className={styles.tableCard}>
            <div className={styles.filterContainer}>
                <select value={filterBy} onChange={e => setFilterBy(e.target.value)} className={styles.filterSelect}>
                    {headers.filter(h => h.filterable).map(h => <option key={h.key} value={h.key}>{h.label}</option>)}
                </select>
                <input type="text" placeholder={`ค้นหาจาก "${headers.find(h => h.key === filterBy)?.label}"...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.filterInput} />
            </div>
            <div className={styles.tableContainer}>
                <table>
                    <thead>
                        <tr>
                            {headers.map(h => (<th key={h.key} onClick={() => h.sortable && requestSort(h.key)}>{h.label}</th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentDocs.length > 0 ? currentDocs.map(doc => (
                            <tr key={doc.doc_id} className={styles.clickableRow} onClick={() => navigate(`/admin/docs/${doc.doc_id}`)}>
                                {headers.map(h => (
                                    <td key={`${doc.doc_id}-${h.key}`}>
                                        {h.isStatus ? <span className={`${styles.status} ${styles[doc.status?.toLowerCase().replace(/\s/g, '')]}`}>{doc.status}</span>
                                            : h.isDate ? new Date(doc[h.key] || 0).toLocaleDateString('th-TH')
                                            : doc[h.key]}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr><td colSpan={headers.length} className={styles.noDataRow}>ไม่มีข้อมูลในรายการนี้</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>
    );
};

// --- Headers Config สำหรับแต่ละตาราง ---
const pendingReviewHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'student_email', label: 'อีเมล', sortable: true, filterable: true },
    { key: 'student_id', label: 'รหัสนักศึกษา', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'submitted_date', label: 'วันที่ส่ง', sortable: true, isDate: true, filterable: true },
    { key: 'status', label: 'สถานะ', sortable: true, isStatus: true, filterable: true },
];
const advisorApprovalHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'student_email', label: 'อีเมล', sortable: true, filterable: true },
    { key: 'student_id', label: 'รหัสนักศึกษา', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'action_date', label: 'วันที่ส่งต่อ', sortable: true, isDate: true, filterable: true },
    { key: 'status', label: 'สถานะ', sortable: true, isStatus: true, filterable: true },
];
const externalApprovalHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'student_email', label: 'อีเมล', sortable: true, filterable: true },
    { key: 'student_id', label: 'รหัสนักศึกษา', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'action_date', label: 'วันที่ส่งต่อ', sortable: true, isDate: true, filterable: true },
    { key: 'status', label: 'สถานะ', sortable: true, isStatus: true, filterable: true },
];
const executiveApprovalHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'student_email', label: 'อีเมล', sortable: true, filterable: true },
    { key: 'student_id', label: 'รหัสนักศึกษา', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'action_date', label: 'วันที่ส่งต่อ', sortable: true, isDate: true, filterable: true },
    { key: 'status', label: 'สถานะ', sortable: true, isStatus: true, filterable: true },
];
// ✅ 1. เพิ่ม Headers Config สำหรับหน้าเอกสารทั้งหมด
const allDocumentsHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'student_email', label: 'อีเมล', sortable: true, filterable: true },
    { key: 'student_id', label: 'รหัสนักศึกษา', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'submitted_date', label: 'วันที่ส่ง', sortable: true, isDate: true, filterable: true },
    { key: 'status', label: 'สถานะปัจจุบัน', sortable: true, isStatus: true, filterable: true },
];

// --- Component "เอกสารรอตรวจ" ---
const PendingReviewSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faInbox} /> เอกสารรอตรวจ</h1>
        <p className={styles.pageDescription}>เอกสารที่ยื่นโดยนักศึกษาและรอการตรวจสอบจากเจ้าหน้าที่เป็นขั้นตอนแรก</p>
        <div className={styles.statsContainer}>
            <div className={styles.statCard}><p className={styles.statTitle}>รอเจ้าหน้าที่ตรวจ</p><h2 className={styles.statValue}>{stats.pendingAdmin}</h2></div>
            <div className={styles.statCard}><p className={styles.statTitle}>เอกสารในระบบทั้งหมด</p><h2 className={styles.statValue}>{stats.totalDocs}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={pendingReviewHeaders} navigate={navigate} />
    </section>
);

// --- Component "อาจารย์ที่ปรึกษาอนุมัติ" ---
const PendingAdvisorSection = ({ documents, stats, navigate }) => {
    const [activeTab, setActiveTab] = useState('inProgress');
    const inProgressDocs = documents.filter(doc => doc.status === 'รออาจารย์อนุมัติ');
    const completedDocs = documents.filter(doc => doc.status !== 'รออาจารย์อนุมัติ');
    return (
        <section className={styles.contentSection}>
            <h1><FontAwesomeIcon icon={faUserTie} /> อาจารย์ที่ปรึกษาอนุมัติ</h1>
            <p className={styles.pageDescription}>เอกสารที่ถูกส่งต่อไปยังอาจารย์ที่ปรึกษาเพื่อรอการอนุมัติ</p>
            <div className={styles.statsContainer}>
                <div className={styles.statCard}><p className={styles.statTitle}>กำลังรออนุมัติ</p><h2 className={styles.statValue}>{stats.pendingAdvisor}</h2></div>
                <div className={styles.statCard}><p className={styles.statTitle}>อนุมัติแล้ววันนี้</p><h2 className={styles.statValue}>0</h2></div>
                <div className={styles.statCard}><p className={styles.statTitle}>ตีกลับวันนี้</p><h2 className={styles.statValue}>0</h2></div>
            </div>
            <div className={styles.tabContainer}>
                <button className={`${styles.tabButton} ${activeTab === 'inProgress' ? styles.activeTab : ''}`} onClick={() => setActiveTab('inProgress')}>รายการที่กำลังดำเนินการ</button>
                <button className={`${styles.tabButton} ${activeTab === 'completed' ? styles.activeTab : ''}`} onClick={() => setActiveTab('completed')}>รายการที่ดำเนินการแล้ว</button>
            </div>
            <DocumentTable documents={activeTab === 'inProgress' ? inProgressDocs : completedDocs} headers={advisorApprovalHeaders} navigate={navigate} />
        </section>
    );
};

// --- Component "อาจารย์ภายนอกอนุมัติ" ---
const PendingExternalSection = ({ documents, stats, navigate }) => {
    const [activeTab, setActiveTab] = useState('inProgress');
    const inProgressDocs = documents.filter(doc => doc.status === 'รออาจารย์ภายนอกอนุมัติ');
    const completedDocs = documents.filter(doc => doc.status !== 'รออาจารย์ภายนอกอนุมัติ');
    return (
        <section className={styles.contentSection}>
            <h1><FontAwesomeIcon icon={faUserSecret} /> อาจารย์ภายนอกอนุมัติ</h1>
            <p className={styles.pageDescription}>เอกสารที่ถูกส่งต่อไปยังอาจารย์ภายนอกเพื่อรอการอนุมัติ</p>
            <div className={styles.statsContainer}>
                <div className={styles.statCard}><p className={styles.statTitle}>กำลังรออนุมัติ</p><h2 className={styles.statValue}>{stats.pendingExternal}</h2></div>
                <div className={styles.statCard}><p className={styles.statTitle}>อนุมัติแล้ววันนี้</p><h2 className={styles.statValue}>0</h2></div>
                <div className={styles.statCard}><p className={styles.statTitle}>ตีกลับวันนี้</p><h2 className={styles.statValue}>0</h2></div>
            </div>
            <div className={styles.tabContainer}>
                <button className={`${styles.tabButton} ${activeTab === 'inProgress' ? styles.activeTab : ''}`} onClick={() => setActiveTab('inProgress')}>รายการที่กำลังดำเนินการ</button>
                <button className={`${styles.tabButton} ${activeTab === 'completed' ? styles.activeTab : ''}`} onClick={() => setActiveTab('completed')}>รายการที่ดำเนินการแล้ว</button>
            </div>
            <DocumentTable documents={activeTab === 'inProgress' ? inProgressDocs : completedDocs} headers={externalApprovalHeaders} navigate={navigate} />
        </section>
    );
};

// --- Component "ผู้บริหารอนุมัติ" ---
const PendingExecutiveSection = ({ documents, stats, navigate }) => {
    const [activeTab, setActiveTab] = useState('inProgress');
    const inProgressDocs = documents.filter(doc => doc.status === 'รอผู้บริหารอนุมัติ');
    const completedDocs = documents.filter(doc => doc.status !== 'รอผู้บริหารอนุมัติ');
    return (
        <section className={styles.contentSection}>
            <h1><FontAwesomeIcon icon={faUserShield} /> ผู้บริหารอนุมัติ</h1>
            <p className={styles.pageDescription}>เอกสารที่ถูกส่งต่อไปยังผู้บริหารเพื่อรอการอนุมัติขั้นสุดท้าย</p>
            <div className={styles.statsContainer}>
                <div className={styles.statCard}><p className={styles.statTitle}>กำลังรออนุมัติ</p><h2 className={styles.statValue}>{stats.pendingExecutive}</h2></div>
                <div className={styles.statCard}><p className={styles.statTitle}>อนุมัติแล้ววันนี้</p><h2 className={styles.statValue}>0</h2></div>
                <div className={styles.statCard}><p className={styles.statTitle}>ตีกลับวันนี้</p><h2 className={styles.statValue}>0</h2></div>
            </div>
            <div className={styles.tabContainer}>
                <button className={`${styles.tabButton} ${activeTab === 'inProgress' ? styles.activeTab : ''}`} onClick={() => setActiveTab('inProgress')}>รายการที่กำลังดำเนินการ</button>
                <button className={`${styles.tabButton} ${activeTab === 'completed' ? styles.activeTab : ''}`} onClick={() => setActiveTab('completed')}>รายการที่ดำเนินการแล้ว</button>
            </div>
            <DocumentTable documents={activeTab === 'inProgress' ? inProgressDocs : completedDocs} headers={executiveApprovalHeaders} navigate={navigate} />
        </section>
    );
};

// ✅ 2. สร้าง Component ใหม่สำหรับหน้า "เอกสารทั้งหมด"
const AllDocumentsSection = ({ documents, stats, navigate }) => {
    return (
        <section className={styles.contentSection}>
            <h1><FontAwesomeIcon icon={faFolderOpen} /> เอกสารทั้งหมด</h1>
            <p className={styles.pageDescription}>ภาพรวมและรายการเอกสารทั้งหมดในระบบ</p>
            
            {/* การ์ดสรุปภาพรวมใหญ่ */}
            {/* ✅✅✅ ส่วนที่เพิ่มเติมเข้ามา ✅✅✅ */}
            <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                    <p className={styles.statTitle}><FontAwesomeIcon icon={faFolderOpen} /> เอกสารทั้งหมดในระบบ</p>
                    <h2 className={styles.statValue}>{stats.totalDocs}</h2>
                </div>
                 <div className={styles.statCard}>
                    <p className={styles.statTitle}><FontAwesomeIcon icon={faHourglassHalf} /> กำลังดำเนินการทั้งหมด</p>
                    <h2 className={styles.statValue}>{stats.inProgress}</h2>
                </div>
                <div className={styles.statCard}>
                    <p className={styles.statTitle}><FontAwesomeIcon icon={faFileCircleCheck} /> อนุมัติแล้วทั้งหมด</p>
                    <h2 className={styles.statValue}>{stats.approved}</h2>
                </div>
                <div className={styles.statCard}>
                    <p className={styles.statTitle}><FontAwesomeIcon icon={faFileCircleXmark} /> ส่งกลับ/ปฏิเสธทั้งหมด</p>
                    <h2 className={styles.statValue}>{stats.rejected}</h2>
                </div>
            </div>

            <DocumentTable documents={documents} headers={allDocumentsHeaders} navigate={navigate} />
        </section>
    );
};

// --- Component หลัก ---
function AdminHomePage() {
    const [stats, setStats] = useState({ 
        pendingAdmin: 0, pendingAdvisor: 0, pendingExternal: 0, pendingExecutive: 0, 
        approved: 0, rejected: 0, inProgress: 0, totalDocs: 0 
    });
    const [allDocs, setAllDocs] = useState({ 
        pendingReview: [], pendingAdvisor: [], pendingExternal: [], pendingExecutive: [],
        all: []
    });
    const [loading, setLoading] = useState(true);
    const { activeSection, setNotifications } = useOutletContext();
    const navigate = useNavigate();

    useEffect(() => {
        const loadAdminData = async () => {
            try {
                const studentsRes = await fetch("/data/student.json");
                const students = await studentsRes.json();
                
                const listKeys = {
                    pendingReview: 'localStorage_pendingDocs',
                    pendingAdvisor: 'localStorage_waitingAdvisorDocs',
                    pendingExternal: 'localStorage_waitingExternalDocs',
                    pendingExecutive: 'localStorage_waitingExecutiveDocs',
                    approved: 'localStorage_approvedDocs',
                    rejected: 'localStorage_rejectedDocs'
                };

                let allLocalStorageDocs = [];
                let docsByStatus = {};

                Object.entries(listKeys).forEach(([key, storageKey]) => {
                    const docs = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    docsByStatus[key] = docs;
                    allLocalStorageDocs.push(...docs);
                });
                
                // ✅ 3. ส่วน Logic การตรวจสอบเอกสารใหม่
                const newNotifications = {};
                Object.entries(docsByStatus).forEach(([sectionKey, docs]) => {
                    if (docs.length > 0) {
                        // หาวันที่ของเอกสารใหม่ที่สุดในหมวดหมู่นี้
                        const latestDocDate = new Date(docs.sort((a,b) => new Date(b.submitted_date) - new Date(a.submitted_date))[0].submitted_date);
                        // หาวันที่ที่เข้ามาดูล่าสุด
                        const lastVisitedDate = new Date(localStorage.getItem(`lastVisited_${sectionKey}`) || 0);

                        // ถ้าเอกสารใหม่กว่าวันที่ดูล่าสุด ให้แจ้งเตือน
                        if (latestDocDate > lastVisitedDate) {
                            newNotifications[sectionKey] = true;
                        }
                    }
                });
                
                // ✅ 4. ส่งข้อมูลการแจ้งเตือนกลับไปให้ Layout
                setNotifications(newNotifications);

                let allStaticDocs = [];
                students.forEach(s => { if (s.documents) allStaticDocs.push(...s.documents); });
                const allSystemDocs = [...allStaticDocs, ...allLocalStorageDocs];
                const uniqueDocs = Array.from(new Map(allSystemDocs.map(doc => [doc.doc_id, doc])).values());
                const totalDocsCount = uniqueDocs.length;
                
                const pendingAdminCount = docsByStatus.pendingReview?.length || 0;
                const pendingAdvisorCount = docsByStatus.pendingAdvisor?.length || 0;
                const pendingExternalCount = docsByStatus.pendingExternal?.length || 0;
                const pendingExecutiveCount = docsByStatus.pendingExecutive?.length || 0;

                setStats({
                    pendingAdmin: pendingAdminCount,
                    pendingAdvisor: pendingAdvisorCount,
                    pendingExternal: pendingExternalCount,
                    pendingExecutive: pendingExecutiveCount,
                    approved: docsByStatus.approved?.length || 0,
                    rejected: docsByStatus.rejected?.length || 0,
                    inProgress: pendingAdminCount + pendingAdvisorCount + pendingExternalCount + pendingExecutiveCount,
                    totalDocs: totalDocsCount,
                });

                const formatDocs = (docs) => docs.map(doc => {
                    const student = students.find(s => s.email === doc.student_email);
                    return { ...doc, studentName: student ? `${student.first_name_th} ${student.last_name_th}`.trim() : 'N/A' };
                }).sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date));

                setAllDocs({
                    pendingReview: formatDocs(docsByStatus.pendingReview || []),
                    pendingAdvisor: formatDocs(docsByStatus.pendingAdvisor || []),
                    pendingExternal: formatDocs(docsByStatus.pendingExternal || []),
                    pendingExecutive: formatDocs(docsByStatus.pendingExecutive || []),
                    all: formatDocs(uniqueDocs)
                });

            } catch (error) {
                console.error("Failed to load admin data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAdminData();
    }, [activeSection, setNotifications]);

    const renderSection = () => {
        switch (activeSection) {
            case 'pending-review':
                return <PendingReviewSection documents={allDocs.pendingReview || []} stats={stats} navigate={navigate} />;
            case 'pending-advisor':
                return <PendingAdvisorSection documents={allDocs.pendingAdvisor || []} stats={stats} navigate={navigate} />;
            case 'pending-external':
                return <PendingExternalSection documents={allDocs.pendingExternal || []} stats={stats} navigate={navigate} />;
            case 'pending-executive':
                return <PendingExecutiveSection documents={allDocs.pendingExecutive || []} stats={stats} navigate={navigate} />;
            case 'all-documents':
                return <AllDocumentsSection documents={allDocs.all || []} stats={stats} navigate={navigate} />;
            default:
                return <PendingReviewSection documents={allDocs.pendingReview || []} stats={stats} navigate={navigate} />;
        }
    };

    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className={styles.pageContainer}>
            {renderSection()}
        </div>
    );
}

export default AdminHomePage;