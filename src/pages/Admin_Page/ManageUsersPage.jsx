import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './ManageUsersPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faUserGraduate, faUserTie, faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';

// Placeholder Components (สำหรับตัวอย่าง)
const OverviewCharts = () => <div className={styles.placeholder}>[Chart Components Placeholder]</div>;
const UserTable = ({ users, type }) => <div className={styles.placeholder}>[Table for {type}: {users.length} items]</div>;

function ManageUsersPage() {
    const { activeSection } = useOutletContext(); // ✅ รับค่ามาจาก Layout
    const [masterData, setMasterData] = useState({ students: [], advisors: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, advisorsRes] = await Promise.all([
                    fetch('/data/student.json'),
                    fetch('/data/advisor.json')
                ]);
                const students = await studentsRes.json();
                const advisors = await advisorsRes.json();
                setMasterData({ students, advisors });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    if (loading) return <div>Loading...</div>;

    const renderSection = () => {
        switch (activeSection) {
            case 'students':
                return <ManageStudentsSection students={masterData.students} />;
            case 'advisors':
                return <ManageAdvisorsSection advisors={masterData.advisors} />;
            case 'overview':
            default:
                return <OverviewSection students={masterData.students} advisors={masterData.advisors} />;
        }
    };

    // ✅✅✅ ลบ Sidebar ออกจาก return นี้ ✅✅✅
    return (
        <div>
            {renderSection()}
        </div>
    );
}

// --- Sub-Components for each section ---
const OverviewSection = ({ students, advisors }) => {
    const masterStudents = students.filter(s => s.degree === 'ปริญญาโท').length;
    const phdStudents = students.filter(s => s.degree === 'ปริญญาเอก').length;
    
    return (
        <section>
            <h1><FontAwesomeIcon icon={faChartPie} /> ภาพรวมผู้ใช้งาน</h1>
            <p>สรุปจำนวนและสัดส่วนผู้ใช้งานทั้งหมดในระบบ</p>
            <div className={styles.overviewGrid}>
                <div className={styles.summaryCard}>
                    <h4>ภาพรวมนักศึกษา</h4>
                    <p>ทั้งหมด: {students.length}</p>
                    <p>ปริญญาโท: {masterStudents}</p>
                    <p>ปริญญาเอก: {phdStudents}</p>
                    <OverviewCharts />
                </div>
                <div className={styles.summaryCard}>
                    <h4>ภาพรวมบุคลากร</h4>
                    <p>ทั้งหมด: {advisors.length}</p>
                    <OverviewCharts />
                </div>
            </div>
        </section>
    );
};

const ManageStudentsSection = ({ students }) => {
    return (
        <section>
            <h1><FontAwesomeIcon icon={faUserGraduate} /> จัดการรายชื่อนักศึกษา</h1>
            <p>เพิ่ม แก้ไข และดูข้อมูลนักศึกษาทั้งหมดในระบบ</p>
            <div className={styles.tableCard}>
                <div className={styles.filterCard}>
                    <h3><FontAwesomeIcon icon={faFilter} /> ตัวกรองข้อมูล</h3>
                </div>
                <div className={styles.tableHeader}>
                    <h2>รายชื่อนักศึกษา ({students.length})</h2>
                    <button className={styles.btnPrimary}><FontAwesomeIcon icon={faPlus} /> เพิ่มนักศึกษาใหม่</button>
                </div>
                <UserTable users={students} type="students" />
            </div>
        </section>
    );
};

const ManageAdvisorsSection = ({ advisors }) => {
     return (
        <section>
            <h1><FontAwesomeIcon icon={faUserTie} /> จัดการรายชื่ออาจารย์</h1>
            <p>เพิ่ม แก้ไข และกำหนดบทบาทของอาจารย์ในระบบ</p>
             <div className={styles.tableCard}>
                <div className={styles.filterCard}>
                     <h3><FontAwesomeIcon icon={faFilter} /> ตัวกรองข้อมูล</h3>
                </div>
                <div className={styles.tableHeader}>
                    <h2>รายชื่ออาจารย์ ({advisors.length})</h2>
                    <button className={styles.btnPrimary}><FontAwesomeIcon icon={faPlus} /> เพิ่มอาจารย์ใหม่</button>
                </div>
                <UserTable users={advisors} type="advisors" />
            </div>
        </section>
    );
};

export default ManageUsersPage;