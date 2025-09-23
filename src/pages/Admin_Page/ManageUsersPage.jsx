// src/pages/Admin_Page/ManageUsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styles from './ManageUsersPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faUserGraduate, faUserTie, faPlus, faFilter, faUndo } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Import ตารางที่เราสร้างขึ้นมาใหม่
import StudentTable from '../../components/admin/StudentTable';
import AdvisorTable from '../../components/admin/AdvisorTable'; // ✅ 1. Import AdvisorTable

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartCard = ({ data, labels }) => {
    const chartData = {
        labels: labels,
        datasets: [{
            label: ' จำนวน',
            data: data,
            backgroundColor: ['#EC4899', '#8B5CF6', '#F59E0B', '#10B981'],
            borderColor: '#FFFFFF', borderWidth: 2,
        }],
    };
    const options = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
    };
    return <div className={styles.chartContainer}><Pie data={chartData} options={options} /></div>;
};


function ManageUsersPage() {
    const { activeSection } = useOutletContext();
    const [masterData, setMasterData] = useState({ students: [], advisors: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            // ✅ ดึงข้อมูลจาก localStorage ก่อน ถ้าไม่มีค่อย fetch จากไฟล์
            const savedStudents = JSON.parse(localStorage.getItem('savedStudents'));
            const savedAdvisors = JSON.parse(localStorage.getItem('savedAdvisors')); // สมมติว่ามีของ advisor ด้วย

            const [studentsRes, advisorsRes] = await Promise.all([
                savedStudents ? Promise.resolve(savedStudents) : fetch('/data/student.json').then(res => res.json()),
                savedAdvisors ? Promise.resolve(savedAdvisors) : fetch('/data/advisor.json').then(res => res.json())
            ]);
            
            // บันทึกข้อมูลตั้งต้นลง localStorage หากยังไม่มี
            if (!savedStudents) localStorage.setItem('savedStudents', JSON.stringify(studentsRes));
            if (!savedAdvisors) localStorage.setItem('savedAdvisors', JSON.stringify(advisorsRes));

            const advisorsWithRoles = advisorsRes.map(adv => ({
                ...adv,
                roles: adv.roles || ['ที่ปรึกษา']
            }));
            
            setMasterData({ students: studentsRes, advisors: advisorsWithRoles });

        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    if (loading) return <div>Loading...</div>;

    const handleAddNewStudent = () => {
        navigate('/admin/manage-users/student/new');
    };
    
    const handleAddNewAdvisor = () => {
        alert('(ตัวอย่าง) กำลังไปที่หน้าเพิ่มอาจารย์ใหม่');
    };

    // ✅ 1. เพิ่มฟังก์ชันสำหรับลบนักศึกษา
    const handleDeleteStudent = (studentIdToDelete) => {
        if (window.confirm(`คุณต้องการลบนักศึกษา ID: ${studentIdToDelete} ใช่หรือไม่?`)) {
            // กรองข้อมูลนักศึกษาคนที่จะลบออก
            const updatedStudents = masterData.students.filter(student => student.student_id !== studentIdToDelete);
            
            // อัปเดต State เพื่อให้หน้าเว็บแสดงผลใหม่ทันที
            setMasterData(prevData => ({
                ...prevData,
                students: updatedStudents
            }));

            // อัปเดตข้อมูลใน localStorage ให้ตรงกัน
            localStorage.setItem('savedStudents', JSON.stringify(updatedStudents));
            
            alert(`ลบนักศึกษา ID: ${studentIdToDelete} เรียบร้อยแล้ว`);
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'students':
                return <ManageStudentsSection 
                            students={masterData.students} 
                            advisors={masterData.advisors} 
                            navigate={navigate}
                            onAddNewStudent={handleAddNewStudent}
                            // ✅ 2. ส่งฟังก์ชันลบลงไปเป็น prop
                            onDeleteStudent={handleDeleteStudent} 
                        />;
            case 'advisors':
                return <ManageAdvisorsSection 
                            advisors={masterData.advisors} 
                            onAddNewAdvisor={handleAddNewAdvisor}
                        />;
            case 'overview':
            default:
                return <OverviewSection students={masterData.students} advisors={masterData.advisors} />;
        }
    };

    return (
        <div>
            {renderSection()}
        </div>
    );
}

// --- Sub-Components ---
const OverviewSection = ({ students, advisors }) => {
    const masterStudents = students.filter(s => s.degree === 'ปริญญาโท').length;
    const phdStudents = students.filter(s => s.degree === 'ปริญญาเอก').length;

    const internalAdvisors = advisors.filter(a => a.type === 'อาจารย์ประจำ').length;
    const externalAdvisors = advisors.filter(a => a.type === 'อาจารย์บัณฑิตพิเศษภายนอก').length;
    const executives = advisors.filter(a => a.type === 'ผู้บริหาร').length;
    
    return (
        <section>
            <h1><FontAwesomeIcon icon={faChartPie} /> ภาพรวมผู้ใช้งาน</h1>
            <p>สรุปจำนวนและสัดส่วนผู้ใช้งานทั้งหมดในระบบ</p>
            <div className={styles.overviewGrid}>
                <div className={styles.summaryCard}>
                    <h4><FontAwesomeIcon icon={faUserGraduate} /> ภาพรวมนักศึกษา</h4>
                    <div className={styles.statGrid}>
                        <div className={styles.statItem}><label>ทั้งหมด</label><span>{students.length}</span></div>
                        <div className={styles.statItem}><label>ปริญญาโท</label><span>{masterStudents}</span></div>
                        <div className={styles.statItem}><label>ปริญญาเอก</label><span>{phdStudents}</span></div>
                    </div>
                    <PieChartCard 
                        labels={['ปริญญาโท', 'ปริญญาเอก']}
                        data={[masterStudents, phdStudents]}
                    />
                </div>
                <div className={styles.summaryCard}>
                    <h4><FontAwesomeIcon icon={faUserTie} /> ภาพรวมบุคลากร</h4>
                    <div className={styles.statGrid}>
                        <div className={styles.statItem}><label>ทั้งหมด</label><span>{advisors.length}</span></div>
                        <div className={styles.statItem}><label>อาจารย์ภายใน</label><span>{internalAdvisors}</span></div>
                        <div className={styles.statItem}><label>อาจารย์ภายนอก</label><span>{externalAdvisors}</span></div>
                        <div className={styles.statItem}><label>ผู้บริหาร</label><span>{executives}</span></div>
                    </div>
                     <PieChartCard 
                        labels={['อาจารย์ภายใน', 'อาจารย์ภายนอก', 'ผู้บริหาร']}
                        data={[internalAdvisors, externalAdvisors, executives]}
                    />
                </div>
            </div>
        </section>
    );
};

// ✅ 3. แก้ไข ManageStudentsSection ให้รับและส่งต่อฟังก์ชัน onDeleteStudent
const ManageStudentsSection = ({ students, advisors, navigate, onAddNewStudent, onDeleteStudent }) => { 
    const [filteredStudents, setFilteredStudents] = useState(students);
    const [filters, setFilters] = useState({ studentId: '', name: '', email: '', advisorId: '' });

    // ใช้ useEffect เพื่ออัปเดต filteredStudents เมื่อ students หลักมีการเปลี่ยนแปลง (เช่น การลบ)
    useEffect(() => {
        let data = [...students];
        if (filters.studentId) data = data.filter(s => s.student_id.includes(filters.studentId));
        if (filters.name) data = data.filter(s => `${s.first_name_th} ${s.last_name_th}`.toLowerCase().includes(filters.name.toLowerCase()));
        if (filters.email) data = data.filter(s => s.email.toLowerCase().includes(filters.email.toLowerCase()));
        if (filters.advisorId) data = data.filter(s => s.main_advisor_id === filters.advisorId);
        setFilteredStudents(data);
    }, [filters, students]); // เพิ่ม students ใน dependency array

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ studentId: '', name: '', email: '', advisorId: '' });
    };

    return (
        <section>
            <h1><FontAwesomeIcon icon={faUserGraduate} /> จัดการรายชื่อนักศึกษา</h1>
            <p>เพิ่ม แก้ไข และดูข้อมูลนักศึกษาทั้งหมดในระบบ</p>
            <div className={styles.tableCard}>
                <div className={styles.filterCard}>
                    <h3><FontAwesomeIcon icon={faFilter} /> ตัวกรองข้อมูลนักศึกษา</h3>
                    <div className={styles.filterGrid}>
                        <div className={styles.filterGroup}><label htmlFor="studentId">รหัสนักศึกษา</label><input type="text" id="studentId" name="studentId" value={filters.studentId} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="name">ชื่อ-นามสกุล</label><input type="text" id="name" name="name" value={filters.name} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="email">อีเมล</label><input type="text" id="email" name="email" value={filters.email} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="advisorId">อาจารย์ที่ปรึกษาหลัก</label><select id="advisorId" name="advisorId" value={filters.advisorId} onChange={handleFilterChange}><option value="">ทั้งหมด</option>{advisors?.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}</select></div>
                    </div>
                    <div className={styles.filterActions}><button onClick={resetFilters}><FontAwesomeIcon icon={faUndo} /> ล้างการค้นหา</button></div>
                </div>
                <div className={styles.tableHeader}>
                    <h2>รายชื่อนักศึกษา ({filteredStudents.length})</h2>
                    <button className={styles.btnPrimary} onClick={onAddNewStudent}><FontAwesomeIcon icon={faPlus} /> เพิ่มนักศึกษาใหม่</button>
                </div>
                <StudentTable 
                    students={filteredStudents} 
                    advisors={advisors} 
                    onDelete={onDeleteStudent} 
                />
            </div>
        </section>
    );
};

const ManageAdvisorsSection = ({ advisors, onAddNewAdvisor, navigate }) => {
    const [filters, setFilters] = useState({ name: '', email: '', phone: '', type: '' });

    const advisorTypes = useMemo(() => [...new Set(advisors.map(a => a.type).filter(Boolean))], [advisors]);

    // ✅ 1. กรองข้อมูลอย่างเดียว ไม่ต้องเรียงลำดับหรือแบ่งหน้าที่นี่
    const filteredAdvisors = useMemo(() => {
        let data = [...advisors];
        if (filters.name) data = data.filter(a => `${a.prefix_th}${a.first_name_th} ${a.last_name_th}`.toLowerCase().includes(filters.name.toLowerCase()));
        if (filters.email) data = data.filter(a => a.email?.toLowerCase().includes(filters.email.toLowerCase()));
        if (filters.phone) data = data.filter(a => a.phone?.includes(filters.phone));
        if (filters.type) data = data.filter(a => a.type === filters.type);
        return data;
    }, [advisors, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ name: '', email: '', phone: '', type: '' });
    };

    return (
        <section>
            <h1><FontAwesomeIcon icon={faUserTie} /> จัดการรายชื่ออาจารย์</h1>
            <p>เพิ่ม แก้ไข และกำหนดบทบาทของอาจารย์ในระบบ</p>
            <div className={styles.tableCard}>
                <div className={styles.filterCard}>
                    <h3><FontAwesomeIcon icon={faFilter} /> ตัวกรองข้อมูลอาจารย์</h3>
                    <div className={styles.filterGrid}>
                        <div className={styles.filterGroup}><label htmlFor="name">ชื่อ-นามสกุล</label><input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="email">อีเมล</label><input type="text" name="email" value={filters.email} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="phone">เบอร์โทรศัพท์</label><input type="text" name="phone" value={filters.phone} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="type">ประเภทของอาจารย์</label><select name="type" value={filters.type} onChange={handleFilterChange}><option value="">ทั้งหมด</option>{advisorTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
                    </div>
                    <div className={styles.filterActions}><button onClick={resetFilters}><FontAwesomeIcon icon={faUndo} /> ล้างการค้นหา</button></div>
                </div>
                <div className={styles.tableHeader}>
                    <h2>รายชื่ออาจารย์ ({filteredAdvisors.length})</h2>
                    <button className={styles.btnPrimary} onClick={onAddNewAdvisor}><FontAwesomeIcon icon={faPlus} /> เพิ่มอาจารย์ใหม่</button>
                </div>
                
                {/* ✅ 2. ส่งข้อมูลที่กรองแล้วและ navigate function ไปให้ AdvisorTable */}
                <AdvisorTable 
                    advisors={filteredAdvisors} 
                    navigate={navigate} 
                />
            </div>
        </section>
    );
};

export default ManageUsersPage;