import React, { useState, useEffect } from 'react';
import styles from './SettingsPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faHistory, faDownload, faExclamationTriangle, faFileUpload, faTrashAlt, faFileAlt, faEdit } from '@fortawesome/free-solid-svg-icons';

// ✅ 1. สร้าง Modal สำหรับแก้ไขชื่อเอกสารโดยเฉพาะ
const EditTemplateNameModal = ({ isOpen, onClose, onSave, currentName }) => {
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNewName(currentName);
        }
    }, [isOpen, currentName]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (newName.trim()) {
            onSave(newName.trim());
        } else {
            alert('กรุณากรอกชื่อเอกสาร');
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h3>แก้ไขชื่อเอกสาร</h3>
                <div className={styles.formGroup}>
                    <label htmlFor="editTemplateName">ชื่อเอกสารใหม่</label>
                    <input 
                        type="text" 
                        id="editTemplateName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className={styles.modalActions}>
                    <button className={styles.cancelButton} onClick={onClose}>ยกเลิก</button>
                    <button className={styles.confirmButton} onClick={handleSave}>บันทึก</button>
                </div>
            </div>
        </div>
    );
};


function SettingsPage() {
    // ... (State อื่นๆ เหมือนเดิม) ...
    const [settings, setSettings] = useState({
        appName: 'Graduate Student Tracking System',
        adminEmail: 'admin@kmitl.ac.th',
        currentYear: new Date().getFullYear() + 543,
        currentSemester: '1',
        submissionsOpen: true,
    });
    
    const [templates, setTemplates] = useState([]);
    const [newTemplate, setNewTemplate] = useState({ name: '', file: null });
    const [loading, setLoading] = useState(true);

    // ✅ 2. เพิ่ม State สำหรับควบคุม Modal แก้ไข
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    useEffect(() => {
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        
        const savedTemplates = localStorage.getItem('documentTemplates');
        if(savedTemplates) setTemplates(JSON.parse(savedTemplates));

        setLoading(false);
    }, []);
    
    // ... (ฟังก์ชัน handleInputChange, handleSaveAllSettings เหมือนเดิม) ...
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleSaveAllSettings = () => {
        localStorage.setItem('systemSettings', JSON.stringify(settings));
        alert('บันทึกการตั้งค่าทั้งหมดเรียบร้อยแล้ว!');
    };
    
    // --- ฟังก์ชันจัดการ Template ---
    const handleTemplateFileChange = (e) => {
        if (e.target.files[0]) setNewTemplate(prev => ({ ...prev, file: e.target.files[0] }));
    };
    const handleTemplateNameChange = (e) => {
        setNewTemplate(prev => ({ ...prev, name: e.target.value }));
    };
    
    const handleAddTemplate = () => {
        if (!newTemplate.name.trim() || !newTemplate.file) {
            alert('กรุณากรอกชื่อและเลือกไฟล์เอกสาร');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(newTemplate.file);
        reader.onload = () => {
            const updatedTemplates = [...templates, {
                id: Date.now(),
                name: newTemplate.name.trim(),
                fileName: newTemplate.file.name,
                fileUrl: reader.result,
                uploadedAt: new Date().toISOString() // ✅ 3. เพิ่มวันที่อัปโหลด
            }];
            setTemplates(updatedTemplates);
            localStorage.setItem('documentTemplates', JSON.stringify(updatedTemplates));
            setNewTemplate({ name: '', file: null });
            document.getElementById('templateFile').value = '';
        };
    };

    const handleDeleteTemplate = (templateId) => {
        if (window.confirm("คุณต้องการลบเอกสาร Template นี้ใช่หรือไม่?")) {
            const updatedTemplates = templates.filter(t => t.id !== templateId);
            setTemplates(updatedTemplates);
            localStorage.setItem('documentTemplates', JSON.stringify(updatedTemplates));
        }
    };
    
    // ✅ 4. เพิ่มฟังก์ชันสำหรับเปิด/ปิด Modal แก้ไข และบันทึกชื่อใหม่
    const openEditModal = (template) => {
        setEditingTemplate(template);
        setIsEditModalOpen(true);
    };

    const handleEditTemplateName = (newName) => {
        const updatedTemplates = templates.map(t => 
            t.id === editingTemplate.id ? { ...t, name: newName } : t
        );
        setTemplates(updatedTemplates);
        localStorage.setItem('documentTemplates', JSON.stringify(updatedTemplates));
        setIsEditModalOpen(false);
        setEditingTemplate(null);
    };

    // --- ฟังก์ชันจัดการข้อมูล (เหมือนเดิม) ---
    const handleBackupData = () => { /* ...เหมือนเดิม... */ };
    const handleResetData = async () => { /* ...เหมือนเดิม... */ };

    // --- ฟังก์ชัน Format วันที่ ---
    const formatThaiDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    if (loading) return <div>กำลังโหลด...</div>;

    const currentYearBE = new Date().getFullYear() + 543;
    const yearOptions = Array.from({ length: 11 }, (_, i) => currentYearBE - 5 + i);

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1>ตั้งค่าระบบ</h1>
                <p>ปรับเปลี่ยนค่าพื้นฐานและกฎเกณฑ์ต่างๆ ของระบบ</p>
            </header>
            
            <div className={styles.settingsContent}>
                {/* ... Fieldsets อื่นๆ เหมือนเดิม ... */}
                <fieldset className={styles.settingFieldset}>
                    <legend>ตั้งค่าทั่วไป</legend>
                    <div className={styles.formGroup}><label htmlFor="appName">ชื่อระบบ/คณะ</label><input type="text" id="appName" name="appName" value={settings.appName} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label htmlFor="adminEmail">อีเมลผู้ดูแลระบบ</label><input type="email" id="adminEmail" name="adminEmail" value={settings.adminEmail} onChange={handleInputChange} /></div>
                </fieldset>
                <fieldset className={styles.settingFieldset}>
                    <legend>ตั้งค่าปีการศึกษา</legend>
                    <div className={styles.formGroupRow}><div className={styles.formGroup}><label htmlFor="currentYear">ปีการศึกษาปัจจุบัน</label><select id="currentYear" name="currentYear" value={settings.currentYear} onChange={handleInputChange}>{yearOptions.map(year => <option key={year} value={year}>{year}</option>)}</select></div><div className={styles.formGroup}><label htmlFor="currentSemester">ภาคการศึกษาปัจจุบัน</label><select id="currentSemester" name="currentSemester" value={settings.currentSemester} onChange={handleInputChange}><option value="1">ภาคการศึกษาที่ 1</option><option value="2">ภาคการศึกษาที่ 2</option><option value="summer">ภาคฤดูร้อน</option></select></div></div>
                    <div className={styles.formGroup}><label className={styles.toggleLabel}><input type="checkbox" name="submissionsOpen" checked={settings.submissionsOpen} onChange={handleInputChange} />เปิดการยื่นเอกสารทั้งหมดในระบบ</label></div>
                </fieldset>
                
                <fieldset className={styles.settingFieldset}>
                    <legend>จัดการเอกสาร Template</legend>
                    <div className={styles.templateUploadSection}>
                        <div className={styles.formGroup}><label htmlFor="templateName">ชื่อเอกสารที่แสดงให้นักศึกษาเห็น</label><input type="text" id="templateName" placeholder="เช่น แบบฟอร์มคำร้องทั่วไป (บ.01)" value={newTemplate.name} onChange={handleTemplateNameChange} /></div>
                        <div className={styles.formGroup}><label htmlFor="templateFile">เลือกไฟล์ (PDF, Word, Excel)</label><div className={styles.fileInputContainer}><label htmlFor="templateFile" className={styles.fileInputLabel}>เลือกไฟล์...</label><input type="file" id="templateFile" onChange={handleTemplateFileChange} className={styles.fileInputHidden}/><span className={styles.fileNameDisplay}>{newTemplate.file ? newTemplate.file.name : "ยังไม่ได้เลือกไฟล์"}</span></div></div>
                        <button className={styles.uploadButton} onClick={handleAddTemplate}><FontAwesomeIcon icon={faFileUpload} /> อัปโหลดเอกสาร</button>
                    </div>

                    <div className={styles.templateList}>
                        <h4>เอกสารที่มีในระบบขณะนี้</h4>
                        {templates.length > 0 ? (
                            <ul>
                                {templates.map(template => (
                                    <li key={template.id}>
                                        <div className={styles.fileInfo}>
                                           <FontAwesomeIcon icon={faFileAlt} />
                                           <div className={styles.fileText}>
                                                {/* ✅ 5. แสดงชื่อและวันที่ */}
                                                <span className={styles.templateName}>{template.name}</span>
                                                <span className={styles.uploadDate}>อัปโหลดเมื่อ: {formatThaiDate(template.uploadedAt)}</span>
                                           </div>
                                        </div>
                                        <div className={styles.templateActions}>
                                            {/* ✅ 6. เพิ่มปุ่มแก้ไข */}
                                            <button onClick={() => openEditModal(template)} className={styles.editButton} title="แก้ไขชื่อ">
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button onClick={() => handleDeleteTemplate(template.id)} className={styles.deleteButton} title="ลบ">
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.noTemplates}>ยังไม่มีเอกสาร Template ในระบบ</p>
                        )}
                    </div>
                </fieldset>

                <div className={styles.mainActions}>
                    <button onClick={handleSaveAllSettings} className={styles.saveButton}>
                        <FontAwesomeIcon icon={faSave} /> บันทึกการตั้งค่าทั้งหมด
                    </button>
                </div>

                <fieldset className={`${styles.settingFieldset} ${styles.dangerZone}`}>
                    <legend><FontAwesomeIcon icon={faExclamationTriangle} /> การจัดการข้อมูล (Danger Zone)</legend>
                    <p className={styles.dangerText}>การดำเนินการในส่วนนี้มีความเสี่ยงสูงและอาจไม่สามารถย้อนกลับได้</p>
                    <div className={styles.dangerActions}>
                        <button className={styles.actionButton} onClick={handleBackupData}><FontAwesomeIcon icon={faDownload} /> สำรองข้อมูลทั้งหมด</button>
                        <button className={styles.dangerButton} onClick={handleResetData}><FontAwesomeIcon icon={faHistory} /> รีเซ็ตข้อมูลโครงสร้าง</button>
                    </div>
                </fieldset>
            </div>

            {/* ✅ 7. Render Modal สำหรับแก้ไข */}
            <EditTemplateNameModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditTemplateName}
                currentName={editingTemplate ? editingTemplate.name : ''}
            />
        </div>
    );
}

export default SettingsPage;