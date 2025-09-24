// src/components/admin/AdvisorTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Admin_Page/ManageUsersPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import PaginationControls from './PaginationControls'; // ตรวจสอบให้แน่ใจว่า path ถูกต้อง

// ✅ 1. เพิ่ม onDelete เข้าไปใน props ที่รับเข้ามา
function AdvisorTable({ advisors, navigate, onDelete }) {
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [advisors]);

    const sortedAdvisors = useMemo(() => {
        let sortableItems = [...advisors];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let valA, valB;
                if (sortConfig.key === 'full_name') {
                    valA = `${a.first_name_th} ${a.last_name_th}`;
                    valB = `${b.first_name_th} ${b.last_name_th}`;
                } else {
                    valA = a[sortConfig.key] || '';
                    valB = b[sortConfig.key] || '';
                }

                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [advisors, sortConfig]);

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

    const totalPages = Math.ceil(sortedAdvisors.length / itemsPerPage);
    const currentTableData = sortedAdvisors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRowClick = (advisorId) => {
        navigate(`/admin/manage-users/advisor/${advisorId}`);
    };

    return (
        <>
            <div className={styles.tableContainer}>
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('full_name')} className={sortConfig.key === 'full_name' ? styles.active : ''}>ชื่อ-นามสกุล <FontAwesomeIcon icon={getSortIcon('full_name')} /></th>
                            <th onClick={() => requestSort('email')} className={sortConfig.key === 'email' ? styles.active : ''}>อีเมล <FontAwesomeIcon icon={getSortIcon('email')} /></th>
                            <th>เบอร์โทรศัพท์</th>
                            <th onClick={() => requestSort('type')} className={sortConfig.key === 'type' ? styles.active : ''}>ประเภท <FontAwesomeIcon icon={getSortIcon('type')} /></th>
                            <th>บทบาท (Roles)</th>
                            <th style={{ textAlign: 'center' }}>ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTableData.length > 0 ? (
                            currentTableData.map((advisor) => (
                                <tr key={advisor.advisor_id} className={styles.clickableRow} onClick={() => handleRowClick(advisor.advisor_id)}>
                                    <td>{`${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`}</td>
                                    <td>{advisor.email || '-'}</td>
                                    <td>{advisor.phone || '-'}</td>
                                    <td>{advisor.type || '-'}</td>
                                    <td>
                                        {advisor.roles && advisor.roles.length > 0 
                                            ? advisor.roles.join(', ') 
                                            : 'ยังไม่ได้กำหนด'
                                        }
                                    </td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtn} title="แก้ไข" onClick={(e) => { e.stopPropagation(); handleRowClick(advisor.advisor_id); }}>
                                            <FontAwesomeIcon icon={faPencilAlt} />
                                        </button>
                                        {/* ✅ 2. แก้ไข onClick ของปุ่มลบ */}
                                        <button 
                                            className={styles.actionBtn} 
                                            title="ลบ" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง tr
                                                onDelete(advisor.advisor_id); // เรียกใช้ฟังก์ชัน onDelete ที่ได้รับมา
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className={styles.noDataRow}>ไม่พบข้อมูลอาจารย์ตามเงื่อนไข</td>
                            </tr>
                        )}
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

export default AdvisorTable;