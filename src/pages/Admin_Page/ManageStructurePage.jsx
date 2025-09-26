import React, { useState, useEffect } from 'react';
import styles from './ManageStructurePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faUniversity, faBookOpen, faTimes } from '@fortawesome/free-solid-svg-icons';

// --- ข้อมูลเริ่มต้น (เหมือนเดิม) ---
const initialDepartments = [
    { "id": 1, "name": "ภาควิชาครุศาสตร์อุตสาหกรรม" },
    { "id": 2, "name": "ภาควิชาครุศาสตร์สถาปัตยกรรมและการออกแบบ" },
    { "id": 3, "name": "ภาควิชาครุศาสตร์วิศวกรรม" },
    { "id": 4, "name": "ภาควิชาครุศาสตร์เกษตร" }
];
const initialPrograms = [
    { "id": 1, "name": "วท.ม. การศึกษาวิทยาศาสตร์และเทคโนโลยี", "degree": "ปริญญาโท", "departmentId": 1 },
    { "id": 2, "name": "ค.อ.ม. นวัตกรรมและการวิจัยเพื่อการเรียนรู้", "degree": "ปริญญาโท", "departmentId": 1 },
    { "id": 3, "name": "ค.อ.ม. การบริหารการศึกษา", "degree": "ปริญญาโท", "departmentId": 1 },
    { "id": 4, "name": "ค.อ.ด. นวัตกรรมและการวิจัยเพื่อการเรียนรู้", "degree": "ปริญญาเอก", "departmentId": 1 },
    { "id": 5, "name": "ค.อ.ด. การบริหารการศึกษา", "degree": "ปริญญาเอก", "departmentId": 1 },
    { "id": 6, "name": "ค.อ.ม. เทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม", "degree": "ปริญญาโท", "departmentId": 2 },
    { "id": 7, "name": "ปร.ด. สาขาวิชาเทคโนโลยีการออกแบบผลิตภัณฑ์อุตสาหกรรม", "degree": "ปริญญาเอก", "departmentId": 2 },
    { "id": 8, "name": "วท.ม. คอมพิวเตอร์ศึกษา", "degree": "ปริญญาโท", "departmentId": 3 },
    { "id": 9, "name": "ค.อ.ม. วิศวกรรมไฟฟ้าสื่อสาร", "degree": "ปริญญาโท", "departmentId": 3 },
    { "id": 10, "name": "ปร.ด. คอมพิวเตอร์ศึกษา", "degree": "ปริญญาเอก", "departmentId": 3 },
    { "id": 11, "name": "ปร.ด. วิศวกรรมไฟฟ้าศึกษา", "degree": "ปริญญาเอก", "departmentId": 3 },
    { "id": 12, "name": "วท.ม. การศึกษาเกษตร", "degree": "ปริญญาโท", "departmentId": 4 },
    { "id": 13, "name": "ปร.ด. การศึกษาเกษตร", "degree": "ปริญญาเอก", "departmentId": 4 }
];

// --- Component Modal สำหรับภาควิชา (เหมือนเดิม) ---
const DepartmentModal = ({ isOpen, mode, department, onClose, onSave }) => {
    const [name, setName] = useState('');
    useEffect(() => {
        if (isOpen && mode === 'edit' && department) {
            setName(department.name);
        } else {
            setName('');
        }
    }, [isOpen, mode, department]);
    if (!isOpen) return null;
    const handleSave = () => {
        if (name.trim()) onSave(name.trim());
        else alert('กรุณากรอกชื่อภาควิชา');
    };
    const title = mode === 'edit' ? 'แก้ไขชื่อภาควิชา' : 'เพิ่มภาควิชาใหม่';
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button onClick={onClose} className={styles.closeButton}><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <div className={styles.modalBody}>
                    <label htmlFor="dept-name">ชื่อภาควิชา</label>
                    <input type="text" id="dept-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="กรอกชื่อภาควิชา..." autoFocus />
                </div>
                <div className={styles.modalActions}>
                    <button className={styles.cancelButton} onClick={onClose}>ยกเลิก</button>
                    <button className={styles.confirmButton} onClick={handleSave}>ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};

// ✅ 1. อัปเกรด Modal ของหลักสูตรให้รองรับ "เพิ่ม" และ "แก้ไข"
const ProgramModal = ({ isOpen, mode, program, onClose, onSave, departments }) => {
    const [programData, setProgramData] = useState({ name: '', degree: '', departmentId: '' });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && program) {
                setProgramData({
                    name: program.name,
                    degree: program.degree,
                    departmentId: program.departmentId
                });
            } else {
                setProgramData({ name: '', degree: '', departmentId: '' });
            }
        }
    }, [isOpen, mode, program]);
    
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProgramData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!programData.name.trim() || !programData.degree || !programData.departmentId) {
            alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }
        onSave(programData);
    };
    
    const title = mode === 'edit' ? 'แก้ไขข้อมูลหลักสูตร' : 'เพิ่มหลักสูตรใหม่';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button onClick={onClose} className={styles.closeButton}><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label htmlFor="prog-name">ชื่อหลักสูตร/สาขาวิชา</label>
                        <input type="text" id="prog-name" name="name" value={programData.name} onChange={handleChange} placeholder="กรอกชื่อหลักสูตร..." autoFocus/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="prog-degree">ระดับปริญญา</label>
                        <select id="prog-degree" name="degree" value={programData.degree} onChange={handleChange}>
                            <option value="">-- เลือกระดับปริญญา --</option>
                            <option value="ปริญญาโท">ปริญญาโท</option>
                            <option value="ปริญญาเอก">ปริญญาเอก</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="prog-dept">สังกัดภาควิชา</label>
                        <select id="prog-dept" name="departmentId" value={programData.departmentId} onChange={handleChange}>
                            <option value="">-- เลือกภาควิชา --</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={styles.modalActions}>
                    <button className={styles.cancelButton} onClick={onClose}>ยกเลิก</button>
                    <button className={styles.confirmButton} onClick={handleSave}>ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};


function ManageStructurePage() {
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [deptModalMode, setDeptModalMode] = useState('add');
    const [currentDepartment, setCurrentDepartment] = useState(null);

    // ✅ 2. อัปเกรด State สำหรับ Modal ของหลักสูตร
    const [isProgModalOpen, setIsProgModalOpen] = useState(false);
    const [progModalMode, setProgModalMode] = useState('add');
    const [currentProgram, setCurrentProgram] = useState(null);

    useEffect(() => {
        const savedDepartments = JSON.parse(localStorage.getItem('departments')) || initialDepartments;
        const savedPrograms = JSON.parse(localStorage.getItem('programs')) || initialPrograms;
        setDepartments(savedDepartments);
        setPrograms(savedPrograms);
        if (!localStorage.getItem('departments')) localStorage.setItem('departments', JSON.stringify(initialDepartments));
        if (!localStorage.getItem('programs')) localStorage.setItem('programs', JSON.stringify(initialPrograms));
        setLoading(false);
    }, []);
    
    // --- ฟังก์ชันสำหรับภาควิชา (เหมือนเดิม) ---
    const openDeptModal = (mode, department = null) => {
        setDeptModalMode(mode);
        setCurrentDepartment(department);
        setIsDeptModalOpen(true);
    };
    const closeDeptModal = () => {
        setIsDeptModalOpen(false);
        setCurrentDepartment(null);
    };
    const handleSaveDepartment = (name) => {
        let updatedDepartments;
        if (deptModalMode === 'add') {
            updatedDepartments = [...departments, { id: Date.now(), name }];
        } else {
            updatedDepartments = departments.map(d => d.id === currentDepartment.id ? { ...d, name } : d);
        }
        setDepartments(updatedDepartments);
        localStorage.setItem('departments', JSON.stringify(updatedDepartments));
        closeDeptModal();
    };
    const handleDeleteDepartment = (deptToDelete) => {
        const isUsed = programs.some(p => p.departmentId === deptToDelete.id);
        if (isUsed) {
            alert(`ไม่สามารถลบภาควิชา "${deptToDelete.name}" ได้ เนื่องจากมีหลักสูตรสังกัดอยู่`);
            return;
        }
        if (window.confirm(`คุณต้องการลบภาควิชา "${deptToDelete.name}" ใช่หรือไม่?`)) {
            const updated = departments.filter(d => d.id !== deptToDelete.id);
            setDepartments(updated);
            localStorage.setItem('departments', JSON.stringify(updated));
        }
    };

    // ✅ 3. สร้าง/อัปเกรดฟังก์ชันสำหรับ "หลักสูตร" ทั้งหมด
    const openProgModal = (mode, program = null) => {
        setProgModalMode(mode);
        setCurrentProgram(program);
        setIsProgModalOpen(true);
    };
    const closeProgModal = () => {
        setIsProgModalOpen(false);
        setCurrentProgram(null);
    };
    const handleSaveProgram = (programData) => {
        let updatedPrograms;
        if (progModalMode === 'add') {
            const newProgram = { id: Date.now(), ...programData };
            updatedPrograms = [...programs, newProgram];
        } else {
            updatedPrograms = programs.map(p => 
                p.id === currentProgram.id ? { ...p, ...programData } : p
            );
        }
        setPrograms(updatedPrograms);
        localStorage.setItem('programs', JSON.stringify(updatedPrograms));
        closeProgModal();
    };
    const handleDeleteProgram = (programToDelete) => {
        // (ในอนาคตอาจเพิ่มเงื่อนไขการตรวจสอบว่ามีนักศึกษาสังกัดหลักสูตรนี้หรือไม่)
        if (window.confirm(`คุณต้องการลบหลักสูตร "${programToDelete.name}" ใช่หรือไม่?`)) {
            const updatedPrograms = programs.filter(p => p.id !== programToDelete.id);
            setPrograms(updatedPrograms);
            localStorage.setItem('programs', JSON.stringify(updatedPrograms));
        }
    };

    const getDepartmentName = (deptId) => {
        const department = departments.find(d => d.id === deptId);
        return department ? department.name : 'ไม่ระบุ';
    };
    
    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1>จัดการโครงสร้างคณะ</h1>
                <p>เพิ่ม ลบ และแก้ไขข้อมูลภาควิชาและหลักสูตร</p>
            </header>
            
            <div className={styles.tabs}>
                <button className={`${styles.tabButton} ${activeTab === 'departments' ? styles.activeTab : ''}`} onClick={() => setActiveTab('departments')}>
                    <FontAwesomeIcon icon={faUniversity} /> จัดการภาควิชา
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'programs' ? styles.activeTab : ''}`} onClick={() => setActiveTab('programs')}>
                    <FontAwesomeIcon icon={faBookOpen} /> จัดการหลักสูตร
                </button>
            </div>

            <div className={styles.contentWrapper}>
                {activeTab === 'departments' && (
                    <div className={styles.tabContent}>
                        <div className={styles.contentHeader}>
                            <h2>รายชื่อภาควิชาทั้งหมด</h2>
                            <button className={styles.addButton} onClick={() => openDeptModal('add')}>
                                <FontAwesomeIcon icon={faPlus} /> เพิ่มภาควิชา
                            </button>
                        </div>
                        <table className={styles.dataTable}>
                            <thead><tr><th>ชื่อภาควิชา</th><th>ดำเนินการ</th></tr></thead>
                            <tbody>
                                {departments.map(dept => (
                                    <tr key={dept.id}>
                                        <td>{dept.name}</td>
                                        <td className={styles.actions}>
                                            <button className={styles.editButton} title="แก้ไข" onClick={() => openDeptModal('edit', dept)}><FontAwesomeIcon icon={faEdit} /></button>
                                            <button className={styles.deleteButton} title="ลบ" onClick={() => handleDeleteDepartment(dept)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'programs' && (
                  <div className={styles.tabContent}>
                    <div className={styles.contentHeader}>
                        <h2>รายชื่อหลักสูตรทั้งหมด</h2>
                        <button className={styles.addButton} onClick={() => openProgModal('add')}>
                            <FontAwesomeIcon icon={faPlus} /> เพิ่มหลักสูตร
                        </button>
                    </div>
                    <table className={styles.dataTable}>
                      <thead><tr><th>ชื่อหลักสูตร/สาขาวิชา</th><th>ระดับปริญญา</th><th>สังกัดภาควิชา</th><th>ดำเนินการ</th></tr></thead>
                      <tbody>
                        {programs.map(prog => (
                          <tr key={prog.id}>
                            <td>{prog.name}</td>
                            <td>{prog.degree}</td>
                            <td>{getDepartmentName(prog.departmentId)}</td>
                            <td className={styles.actions}>
                                {/* ✅ 4. เพิ่ม onClick ให้ปุ่มของตารางหลักสูตร */}
                                <button className={styles.editButton} title="แก้ไข" onClick={() => openProgModal('edit', prog)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button className={styles.deleteButton} title="ลบ" onClick={() => handleDeleteProgram(prog)}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
            
            <DepartmentModal 
                isOpen={isDeptModalOpen}
                mode={deptModalMode}
                department={currentDepartment}
                onClose={closeDeptModal}
                onSave={handleSaveDepartment}
            />

            <ProgramModal 
                isOpen={isProgModalOpen}
                mode={progModalMode}
                program={currentProgram}
                onClose={closeProgModal}
                onSave={handleSaveProgram}
                departments={departments}
            />
        </div>
    );
}

export default ManageStructurePage;