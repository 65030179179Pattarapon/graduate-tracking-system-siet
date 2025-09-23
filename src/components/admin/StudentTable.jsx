// src/components/admin/StudentTable.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Admin_Page/ManageUsersPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import PaginationControls from './PaginationControls';

function StudentTable({ students, advisors, onDelete }) {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: 'student_id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // รีเซ็ตหน้าเมื่อข้อมูลนักศึกษาเปลี่ยน
    useEffect(() => {
        setCurrentPage(1);
    }, [students]);

    const sortedStudents = useMemo(() => {
        let sortableItems = [...students];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let valA = a[sortConfig.key] || '';
                let valB = b[sortConfig.key] || '';

                if (sortConfig.key === 'first_name_th') {
                    valA = `${a.first_name_th} ${a.last_name_th}`;
                    valB = `${b.first_name_th} ${b.last_name_th}`;
                }

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
        setCurrentPage(1);
    };

    const getSortIcon = (key) => {
        if (sortConfig?.key !== key) return faSort;
        return sortConfig.direction === 'ascending' ? faSortUp : faSortDown;
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
                            {/* ✅ เพิ่ม className เพื่อให้ CSS ทำงาน */}
                            <th onClick={() => requestSort('student_id')} className={sortConfig.key === 'student_id' ? styles.active : ''}>
                                รหัสนักศึกษา <FontAwesomeIcon icon={getSortIcon('student_id')} />
                            </th>
                            <th onClick={() => requestSort('first_name_th')} className={sortConfig.key === 'first_name_th' ? styles.active : ''}>
                                ชื่อ-นามสกุล <FontAwesomeIcon icon={getSortIcon('first_name_th')} />
                            </th>
                            <th onClick={() => requestSort('email')} className={sortConfig.key === 'email' ? styles.active : ''}>
                                อีเมล <FontAwesomeIcon icon={getSortIcon('email')} />
                            </th>
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
                                        <button 
                                            className={styles.actionBtn} 
                                            title="ลบ" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง tr
                                                onDelete(student.student_id); 
                                            }}
                                        >
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