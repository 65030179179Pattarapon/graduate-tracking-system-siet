import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Admin_Page/ManageUsersPage.module.css'; // ใช้สไตล์ร่วมกัน
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import PaginationControls from './PaginationControls';

// ✅ 1. แก้ไข props ให้รับ navigate มาใช้งาน
function StudentTable({ students, advisors, navigate }) { // ✅ รับ navigate มา
    // ❌ ไม่ต้องประกาศ useNavigate ซ้ำที่นี่
    // const navigate = useNavigate(); 
    const [sortConfig, setSortConfig] = useState({ key: 'student_id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const sortedStudents = useMemo(() => {
        let sortableItems = [...students];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [students, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTableData = sortedStudents.slice(indexOfFirstItem, indexOfLastItem);
    
    const totalPages = Math.ceil(students.length / itemsPerPage);

    return (
        <>
            <div className={styles.tableContainer}>
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('student_id')}>รหัสนักศึกษา</th>
                            <th onClick={() => requestSort('first_name_th')}>ชื่อ-นามสกุล</th>
                            <th onClick={() => requestSort('email')}>อีเมล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>ที่ปรึกษาหลัก</th>
                            <th style={{textAlign: 'right'}}>ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTableData.map((student) => {
                            const mainAdvisor = advisors.find(a => a.advisor_id === student.main_advisor_id);
                            const advisorName = mainAdvisor ? `${mainAdvisor.prefix_th}${mainAdvisor.first_name_th} ${mainAdvisor.last_name_th}`.trim() : '-';
                            return (
                                // ✅ 2. เพิ่ม onClick ให้กับ <tr> เพื่อให้คลิกได้
                                <tr key={student.student_id} className={styles.clickableRow} onClick={() => navigate(`/admin/manage-users/student/${student.student_id}`)}>
                                    <td>{student.student_id}</td>
                                    <td>{`${student.prefix_th}${student.first_name_th} ${student.last_name_th}`}</td>
                                    <td>{student.email}</td>
                                    <td>{student.phone || '-'}</td>
                                    <td>{advisorName}</td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtn} title="แก้ไข" onClick={(e) => { e.stopPropagation(); navigate(`/admin/manage-users/student/${student.student_id}`) }}>
                                            <FontAwesomeIcon icon={faPencilAlt} />
                                        </button>
                                        <button className={styles.actionBtn} title="ลบ" onClick={(e) => { e.stopPropagation(); alert(`Delete ${student.student_id}`); }}>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 &&
                <div className={styles.pagination}>
                    <PaginationControls 
                        currentPage={currentPage} 
                        totalPages={totalPages}
                        onPageChange={page => setCurrentPage(page)}
                    />
                </div>
            }
        </>
    );
}

export default StudentTable;