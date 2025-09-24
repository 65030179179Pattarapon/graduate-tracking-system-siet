import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Admin_Page/ManageUsersPage.module.css'; // ใช้สไตล์ร่วมกัน

const AdviseeTable = ({ students, advisorId }) => {
    const navigate = useNavigate();

    // ✅ ฟังก์ชันสำหรับตรวจสอบบทบาทของอาจารย์ต่อนักศึกษาแต่ละคน
    const getAdvisorRole = (student) => {
        if (student.main_advisor_id === advisorId) {
            return 'ที่ปรึกษาหลัก';
        }
        if (student.co_advisor1_id === advisorId || student.co_advisor2_id === advisorId) {
            return 'ที่ปรึกษาร่วม';
        }
        return 'ไม่ระบุ'; // กรณีที่ไม่ตรงกับเงื่อนไขไหนเลย
    };

    const handleRowClick = (studentId) => {
        // ทำให้สามารถคลิกเพื่อไปดูรายละเอียดของนักศึกษาคนนั้นๆ ได้
        navigate(`/admin/manage-users/student/${studentId}`);
    };

    return (
        <div className={styles.tableContainer}>
            <table>
                <thead>
                    <tr>
                        <th>รหัสนักศึกษา</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>อีเมล</th>
                        <th>ระดับการศึกษา</th>
                        <th>หลักสูตร</th>
                        <th>บทบาท</th>
                        <th>สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    {students && students.length > 0 ? (
                        students.map((student) => (
                            <tr 
                                key={student.student_id} 
                                className={styles.clickableRow} 
                                onClick={() => handleRowClick(student.student_id)}
                            >
                                <td>{student.student_id}</td>
                                <td>{`${student.prefix_th}${student.first_name_th} ${student.last_name_th}`}</td>
                                <td>{student.email}</td>
                                <td>{student.degree || '-'}</td>
                                <td>{student.program || '-'}</td>
                                <td>{getAdvisorRole(student)}</td>
                                <td>{student.student_status || 'ไม่ระบุ'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className={styles.noDataRow}>
                                ไม่มีนักศึกษาในที่ปรึกษา
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdviseeTable;