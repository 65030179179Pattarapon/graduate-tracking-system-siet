import React from 'react';
import styles from './SidebarAdmin.module.css'; // ใช้สไตล์ร่วมกับ Sidebar เดิม
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faUserGraduate, faUserTie } from '@fortawesome/free-solid-svg-icons';

function SidebarManageUser({ activeSection, setSection }) {
    const menuItems = [
        { id: 'overview', icon: faChartPie, text: 'สรุปภาพรวม' },
        { id: 'students', icon: faUserGraduate, text: 'จัดการนักศึกษา' },
        { id: 'advisors', icon: faUserTie, text: 'จัดการอาจารย์' },
    ];

    return (
        <aside className={styles.sidebar}>
            {menuItems.map(item => (
                <button
                    key={item.id}
                    className={`${styles.sidebarBtn} ${activeSection === item.id ? styles.active : ''}`}
                    onClick={() => setSection(item.id)}
                >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.text}</span>
                </button>
            ))}
        </aside>
    );
}

export default SidebarManageUser;