import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ManageUsersPage.module.css'; // ใช้สไตล์ร่วมกัน
import detailStyles from './ManageAdvisorDetailPage.module.css'; // ใช้สไตล์จากหน้ารายละเอียดอาจารย์
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCog, faUser, faSitemap, faUserGraduate, faFileAlt, 
    faArrowLeft, faSave, faPlus, faTrashAlt, faEye, faEyeSlash, faSyncAlt,
    faUserTie,
    faPencilAlt, // 👈 เพิ่มไอคอน "แก้ไข"
    faTimes // 👈 เพิ่มไอคอน "ยกเลิก"
} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import AdviseeTable from '../../components/admin/AdviseeTable';

// --- Constants for Dropdowns ---
const THAI_PREFIXES = ['นาย', 'นาง', 'นางสาว', 'อ.', 'ผศ.', 'รศ.', 'ศ.', 'ผศ.ดร.', 'รศ.ดร.', 'ศ.ดร.'];
const ENG_PREFIXES = ['Mr.', 'Mrs.', 'Ms.', 'Lecturer', 'Asst. Prof.', 'Assoc. Prof.', 'Prof.', 'Asst. Prof. Dr.', 'Assoc. Prof. Dr.', 'Prof. Dr.'];
const GENDERS = ['ชาย', 'หญิง', 'อื่นๆ'];
const ADVISOR_TYPES = ["อาจารย์ประจำ", "อาจารย์ประจำหลักสูตร", "อาจารย์ผู้รับผิดชอบหลักสูตร", "อาจารย์บัณฑิตพิเศษภายใน", "อาจารย์บัณฑิตพิเศษภายนอก", "ผู้บริหาร"];
const ADVISOR_ROLES = ["สอน", "สอบ", "ที่ปรึกษาวิทยานิพนธ์", "ที่ปรึกษาวิทยานิพนธ์ร่วม", "คณบดี", "ผู้ช่วยคณบดี"];
const ASSISTANT_DEAN_DEPTS = ["วิชาการและวิจัย", "พัฒนานักศึกษา", "บริหาร"];

// --- Sub-Components for each section ---

const Sidebar = ({ advisor, activeSection, setActiveSection, onBack }) => (
    <aside className={detailStyles.sidebar}>
        <div className={detailStyles.studentProfileCard}>
            <div className={detailStyles.profileImageContainer}>
                {advisor.profile_img ? (
                    <img src={advisor.profile_img} alt="Advisor Profile" className={detailStyles.profileImage} />
                ) : (
                    <div className={detailStyles.noImagePlaceholder}>ไม่มีภาพ</div>
                )}
            </div>
            <div className={detailStyles.studentName}>{advisor.prefix_th}{advisor.first_name_th} {advisor.last_name_th}</div>
            <div className={detailStyles.studentEmail}>{advisor.email}</div>
        </div>
        <hr className={detailStyles.divider} />
        {[
            { id: 'account', icon: faUserCog, text: 'การจัดการบัญชี' },
            { id: 'info', icon: faUser, text: 'ข้อมูลทั่วไป' },
            { id: 'roles', icon: faSitemap, text: 'บทบาทและหลักสูตร' },
            { id: 'advisees', icon: faUserGraduate, text: 'นักศึกษาในที่ปรึกษา' },
            { id: 'publications', icon: faFileAlt, text: 'ผลงานตีพิมพ์' },
        ].map(item => (
            <button key={item.id} className={`${detailStyles.sidebarBtn} ${activeSection === item.id ? detailStyles.active : ''}`} onClick={() => setActiveSection(item.id)}>
                <FontAwesomeIcon icon={item.icon} /><span>{item.text}</span>
            </button>
        ))}
        <hr className={detailStyles.divider} />
        <button className={detailStyles.sidebarBtn} onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} /><span>กลับหน้ารายชื่อ</span>
        </button>
    </aside>
);

const AccountSection = ({ data, onInputChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        onInputChange({ target: { name: 'password', value: password } });
        onInputChange({ target: { name: 'confirm_password', value: password } });
    };

    return (
        <div className={detailStyles.card}>
            <h3><FontAwesomeIcon icon={faUserCog} /> การจัดการบัญชี</h3>
            <div className={detailStyles.cardBody}>
                <div className={detailStyles.formSection}>
                    <h4>ข้อมูลปัจจุบัน</h4>
                    <div className={detailStyles.formGrid}>
                        <div className={detailStyles.formGroup}>
                            <label>อีเมล (สำหรับเข้าสู่ระบบ)</label>
                            <input type="email" value={data.email || ''} disabled />
                        </div>
                        <div className={detailStyles.formGroup}>
                            <label>รหัสผ่านปัจจุบัน</label>
                            <input 
                                type="password"
                                value="••••••••" 
                                readOnly
                                className={detailStyles.readOnlyInput}
                            />
                        </div>
                    </div>
                </div>
                
                <div className={detailStyles.formSection}>
                    <h4>แก้ไขข้อมูลบัญชี</h4>
                    <div className={detailStyles.formGrid}>
                        <div className={detailStyles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label>อีเมลใหม่ (สำหรับเข้าสู่ระบบ)</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="กรอกอีเมลใหม่ (ถ้าต้องการเปลี่ยน)" 
                                value={data.email || ''}
                                onChange={onInputChange}
                            />
                        </div>
                        <div className={detailStyles.formGroup}>
                            <label>รหัสผ่านใหม่</label>
                            <div className={detailStyles.passwordInputWrapper}>
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    name="password" 
                                    placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
                                    value={data.password || ''}
                                    onChange={onInputChange}
                                />
                                <FontAwesomeIcon 
                                    icon={faSyncAlt} 
                                    className={detailStyles.passwordIcon}
                                    onClick={generatePassword}
                                    title="สุ่มรหัสผ่านใหม่"
                                />
                            </div>
                        </div>
                        <div className={detailStyles.formGroup}>
                            <label>ยืนยันรหัสผ่านใหม่</label>
                            <div className={detailStyles.passwordInputWrapper}>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    name="confirm_password" 
                                    value={data.confirm_password || ''} 
                                    onChange={onInputChange}
                                    placeholder="ยืนยันรหัสผ่านใหม่"
                                />
                                <FontAwesomeIcon 
                                    icon={showPassword ? faEyeSlash : faEye} 
                                    className={detailStyles.passwordIcon}
                                    style={{ right: '40px' }} 
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoSection = ({ data, onInputChange }) => (
    <div className={detailStyles.card}>
        <h3><FontAwesomeIcon icon={faUser} /> ข้อมูลทั่วไป</h3>
        <div className={detailStyles.cardBody}>
            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`} style={{ marginBottom: '25px' }}>
                <div className={detailStyles.formGroup}> 
                    <label>รหัสอาจารย์</label>
                    <input type="text" value={data.advisor_id || ''} disabled />
                </div>
            </div>
            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`} style={{ marginBottom: '25px' }}>
                <div className={detailStyles.formGroup}><label>คำนำหน้า/ยศ (ไทย)</label><select name="prefix_th" value={data.prefix_th || ''} onChange={onInputChange}>{THAI_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div className={detailStyles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" name="first_name_th" value={data.first_name_th || ''} onChange={onInputChange} /></div>
                <div className={detailStyles.formGroup}><label>ชื่อกลาง (ไทย)</label><input type="text" name="middle_name_th" value={data.middle_name_th || ''} onChange={onInputChange} /></div>
                <div className={detailStyles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" name="last_name_th" value={data.last_name_th || ''} onChange={onInputChange} /></div>
            </div>
            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`} style={{ marginBottom: '25px' }}>
                <div className={detailStyles.formGroup}><label>คำนำหน้า (อังกฤษ)</label><select name="prefix_en" value={data.prefix_en || ''} onChange={onInputChange}>{ENG_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div className={detailStyles.formGroup}><label>First Name (อังกฤษ)</label><input type="text" name="first_name_en" value={data.first_name_en || ''} onChange={onInputChange} /></div>
                <div className={detailStyles.formGroup}><label>Middle Name (อังกฤษ)</label><input type="text" name="middle_name_en" value={data.middle_name_en || ''} onChange={onInputChange} /></div>
                <div className={detailStyles.formGroup}><label>Last Name (อังกฤษ)</label><input type="text" name="last_name_en" value={data.last_name_en || ''} onChange={onInputChange} /></div>
            </div>
            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`} style={{ marginBottom: '25px' }}>
                <div className={detailStyles.formGroup}><label>อีเมลสำหรับติดต่อ</label><input type="email" name="contact_email" value={data.contact_email || ''} onChange={onInputChange} /></div>
                <div className={detailStyles.formGroup}><label>เบอร์โทรศัพท์หลัก</label><input type="tel" name="phone" value={data.phone || ''} onChange={onInputChange} /></div>
                <div className={detailStyles.formGroup}><label>เบอร์โทรศัพท์สำรอง</label><input type="tel" name="secondary_phone" value={data.secondary_phone || ''} onChange={onInputChange} /></div>
                <div className={detailStyles.formGroup}><label>ห้อง/สถานที่ทำงาน</label><input type="text" name="office_location" value={data.office_location || ''} onChange={onInputChange} /></div>
            </div>
            <div className={`${detailStyles.formGrid} ${detailStyles.fourCols}`}>
                <div className={detailStyles.formGroup}>
                    <label>เพศ</label>
                    <select name="gender" value={data.gender || ''} onChange={onInputChange}>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    
                    {/* ✅✅✅ เพิ่มเงื่อนไขและ input นี้เข้าไป ✅✅✅ */}
                    {data.gender === 'อื่นๆ' && (
                        <input
                            type="text"
                            name="gender_other" // ชื่อ state ที่เราเพิ่มเข้าไป
                            value={data.gender_other || ''}
                            onChange={onInputChange}
                            placeholder="โปรดระบุ"
                            style={{ marginTop: '10px' }} // เพิ่มระยะห่างด้านบน
                        />
                    )}
                </div>
            </div>

        </div>
    </div>
);

// ✅✅✅ แก้ไข RolesSection ทั้งหมดตามนี้ ✅✅✅
const RolesSection = ({ data, onInputChange, onArrayChange, allPrograms }) => {
    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของ Checkbox
    const handleRoleChange = (e) => {
        const { name, checked } = e.target;
        const currentRoles = data.roles || [];
        const updatedRoles = checked
            ? [...currentRoles, name]
            : currentRoles.filter(role => role !== name);
        onArrayChange('roles', updatedRoles);
    };

    // ฟังก์ชันสำหรับเพิ่มแถวหลักสูตร
    const handleAddProgram = () => {
        const currentPrograms = data.assigned_programs || [];
        // ✅ เพิ่ม ID ว่างๆ เข้าไปใน Array
        onArrayChange('assigned_programs', [...currentPrograms, '']); 
    };

    // ฟังก์ชันสำหรับลบแถวหลักสูตร
    const handleRemoveProgram = (index) => {
        const updatedPrograms = (data.assigned_programs || []).filter((_, i) => i !== index);
        onArrayChange('assigned_programs', updatedPrograms);
    };
    
    // ฟังก์ชันสำหรับอัปเดตค่าในแถวหลักสูตร
    const handleProgramChange = (index, newProgramId) => {
        const updatedPrograms = (data.assigned_programs || []).map((programId, i) => 
            i === index ? Number(newProgramId) : programId // ✅ เปลี่ยนค่าใน Array ตาม index
        );
        onArrayChange('assigned_programs', updatedPrograms);
    };

    return (
        <>
            {/* --- Card 1: ประเภทของอาจารย์ --- */}
            <div className={detailStyles.card}>
                <h3><FontAwesomeIcon icon={faUserTie} /> ประเภทของอาจารย์</h3>
                <div className={detailStyles.cardBody}>
                    <div className={`${detailStyles.formGrid} ${detailStyles.oneCol}`}>
                        <select name="type" value={data.type || ''} onChange={onInputChange}>
                            <option value="">-- กรุณาเลือกประเภท --</option>
                            {ADVISOR_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- Card 2: บทบาทหน้าที่ --- */}
            <div className={detailStyles.card}>
                <h3><FontAwesomeIcon icon={faSitemap} /> บทบาทหน้าที่</h3>
                <div className={detailStyles.cardBody}>
                    <div className={`${detailStyles.formGrid} ${detailStyles.threeCols}`}>
                        {ADVISOR_ROLES.map(role => (
                            <div key={role} className={detailStyles.formGroup}>
                                <label className={detailStyles.checkboxContainer}>
                                    <input
                                        type="checkbox"
                                        name={role}
                                        checked={(data.roles || []).includes(role)}
                                        onChange={handleRoleChange}
                                    />
                                    <span className={detailStyles.checkmark}></span> {role}
                                </label>
                            </div>
                        ))}
                    </div>
                    {(data.roles || []).includes('ผู้ช่วยคณบดี') && (
                        <div className={`${detailStyles.formGrid} ${detailStyles.oneCol}`} style={{marginTop: '15px'}}>
                            <div className={detailStyles.formGroup}>
                                <label>ฝ่ายสำหรับผู้ช่วยคณบดี</label>
                                <select name="assistant_dean_dept" value={data.assistant_dean_dept || ''} onChange={onInputChange}>
                                    <option value="">-- เลือกฝ่าย --</option>
                                    {ASSISTANT_DEAN_DEPTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Card 3: หลักสูตรที่ได้รับมอบหมาย --- */}
            <div className={detailStyles.card}>
                <h3><FontAwesomeIcon icon={faUserGraduate} /> หลักสูตรที่ได้รับมอบหมาย</h3>
                <div className={detailStyles.cardBody}>
                    {(data.assigned_programs || []).map((programId, index) => (
                        <div key={index} className={detailStyles.programItem}>
                            {/* ✅ แก้ไข value ให้ตรงกับ programId ที่เป็น Number */}
                            <select value={programId} onChange={e => handleProgramChange(index, e.target.value)}>
                                <option value="">-- เลือกหลักสูตร --</option>
                                {/* ✅ แก้ไข Key ให้ตรงกับข้อมูลใน programs.json */}
                                {allPrograms.map(p => (
                                    <option key={p.id} value={p.id}>
                                        ({p.degreeLevel}) {p.name}
                                    </option>
                                ))}
                            </select>
                            <button type="button" className={detailStyles.removeBtn} onClick={() => handleRemoveProgram(index)}>
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    ))}
                    <button type="button" className={detailStyles.addBtn} onClick={handleAddProgram}>
                        <FontAwesomeIcon icon={faPlus} /> เพิ่มหลักสูตร
                    </button>
                </div>
            </div>
        </>
    );
};

// ✅✅✅ โค้ดทั้งหมดสำหรับ AdviseesSection ✅✅✅
const AdviseesSection = ({ advisorId, allStudents }) => {

    // ใช้ useMemo เพื่อกรองรายชื่อนักศึกษาอย่างมีประสิทธิภาพ
    const advisees = useMemo(() => {
        // ตรวจสอบก่อนว่า allStudents เป็น array ที่พร้อมใช้งาน
        if (!allStudents || !Array.isArray(allStudents)) {
            return [];
        }

        // กรองนักศึกษาโดยเช็คจาก id ของอาจารย์ที่ปรึกษาหลักและที่ปรึกษาร่วม
        return allStudents.filter(student => 
            student.main_advisor_id === advisorId || 
            student.co_advisor1_id === advisorId || 
            student.co_advisor2_id === advisorId
        );
    }, [advisorId, allStudents]); // ฟังก์ชันนี้จะทำงานใหม่เมื่อค่าเหล่านี้เปลี่ยนไปเท่านั้น

    return (
        <div className={detailStyles.card}>
            <h3>
                <FontAwesomeIcon icon={faUserGraduate} /> นักศึกษาในที่ปรึกษา ({advisees.length})
            </h3>
            <div className={detailStyles.cardBody}>
                {/* ส่งข้อมูลนักศึกษาที่กรองแล้ว (advisees) และ advisorId 
                  ไปยัง AdviseeTable เพื่อแสดงผล
                */}
                <AdviseeTable students={advisees} advisorId={advisorId} />
            </div>
        </div>
    );
};

// ✅✅✅ โค้ดทั้งหมดสำหรับ PublicationsSection ✅✅✅
const PublicationsSection = ({ data, onArrayChange }) => {
    // State สำหรับควบคุม UI การเพิ่มและแก้ไข
    const [isAdding, setIsAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    
    // State สำหรับเก็บข้อมูลที่กำลังเพิ่มหรือแก้ไข
    const [formData, setFormData] = useState({ title: '', publish_date: '', publication_type: '', attachment_file: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- ฟังก์ชันจัดการการเพิ่มข้อมูล ---
    const handleAddNew = () => {
        setFormData({ title: '', publish_date: '', publication_type: '', attachment_file: '' }); // รีเซ็ตฟอร์ม
        setIsAdding(true);
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
    };

    const handleSaveNew = () => {
        if (!formData.title) {
            alert('กรุณากรอกชื่อผลงาน');
            return;
        }
        const currentWorks = data.academic_works || [];
        onArrayChange('academic_works', [...currentWorks, formData]);
        setIsAdding(false);
    };

    // --- ฟังก์ชันจัดการการแก้ไขข้อมูล ---
    const handleEdit = (work, index) => {
        setEditingIndex(index);
        setFormData(work); // นำข้อมูลเดิมมาใส่ในฟอร์ม
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
    };

    const handleSaveEdit = (index) => {
        if (!formData.title) {
            alert('กรุณากรอกชื่อผลงาน');
            return;
        }
        const updatedWorks = (data.academic_works || []).map((work, i) => 
            i === index ? formData : work
        );
        onArrayChange('academic_works', updatedWorks);
        setEditingIndex(null);
    };

    // --- ฟังก์ชันจัดการการลบข้อมูล ---
    const handleDelete = (indexToDelete) => {
        if (window.confirm('คุณต้องการลบผลงานนี้ใช่หรือไม่?')) {
            const updatedWorks = (data.academic_works || []).filter((_, index) => index !== indexToDelete);
            onArrayChange('academic_works', updatedWorks);
        }
    };

    const renderFormRow = (onSave, onCancel) => (
        <tr className={detailStyles.newRow}>
            <td><input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="ชื่อผลงาน" className={styles.formControl} /></td>
            <td><input type="date" name="publish_date" value={formData.publish_date} onChange={handleInputChange} className={styles.formControl} /></td>
            <td><input type="text" name="publication_type" value={formData.publication_type} onChange={handleInputChange} placeholder="เช่น วารสาร Q1, IEEE Conference" className={styles.formControl} /></td>
            <td><input type="text" name="attachment_file" value={formData.attachment_file} onChange={handleInputChange} placeholder="ลิงก์ไฟล์แนบ" className={styles.formControl} /></td>
            <td className={detailStyles.actionCell}>
                <button className={detailStyles.actionBtnConfirm} onClick={onSave} title="บันทึก"><FontAwesomeIcon icon={faSave} /></button>
                <button className={detailStyles.actionBtnCancel} onClick={onCancel} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
            </td>
        </tr>
    );

    return (
        <div className={detailStyles.card}>
            <h3><FontAwesomeIcon icon={faFileAlt} /> ผลงานตีพิมพ์</h3>
            <div className={detailStyles.cardBody}>
                <div className={detailStyles.tableWrapper}>
                    <table className={detailStyles.dataTable}>
                        <thead>
                            <tr>
                                <th>ชื่อผลงาน</th>
                                {/* ✅ เพิ่ม className ให้กับหัวข้อที่ต้องการ */}
                                <th className={detailStyles.textCenter}>วันที่ตีพิมพ์</th>
                                <th className={detailStyles.textCenter}>ลักษณะการตีพิมพ์</th>
                                <th className={detailStyles.textCenter}>ไฟล์แนบ</th>
                                <th className={detailStyles.textCenter}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.academic_works || []).map((work, index) => 
                                editingIndex === index ? (
                                    renderFormRow(() => handleSaveEdit(index), handleCancelEdit)
                                ) : (
                                    <tr key={index}>
                                        <td>{work.title}</td>
                                        {/* ✅ เพิ่ม className ให้กับเนื้อหาที่ต้องการ */}
                                        <td className={detailStyles.textCenter}>{work.publish_date}</td>
                                        <td className={detailStyles.textCenter}>{work.publication_type}</td>
                                        <td className={detailStyles.textCenter}>
                                            {work.attachment_file && (
                                                <a href={work.attachment_file} target="_blank" rel="noopener noreferrer" className={detailStyles.linkButton}>
                                                    ดูเอกสาร
                                                </a>
                                            )}
                                        </td>
                                        <td className={detailStyles.textCenter}>
                                            <button className={detailStyles.actionBtn} title="แก้ไข" onClick={() => handleEdit(work, index)}>
                                                <FontAwesomeIcon icon={faPencilAlt} />
                                            </button>
                                            <button className={detailStyles.actionBtn} title="ลบ" onClick={() => handleDelete(index)}>
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            )}
                            {isAdding && renderFormRow(handleSaveNew, handleCancelAdd)}
                            {(data.academic_works || []).length === 0 && !isAdding && (
                                <tr>
                                    <td colSpan="5" className={detailStyles.noDataRow}>ยังไม่มีผลงานตีพิมพ์</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {!isAdding && (
                    <button type="button" className={detailStyles.addBtn} onClick={handleAddNew} style={{marginTop: '20px'}}>
                        <FontAwesomeIcon icon={faPlus} /> เพิ่มผลงานตีพิมพ์
                    </button>
                )}
            </div>
        </div>
    );
};


// --- Main Component ---
function ManageAdvisorDetailPage() {
    const { advisorId } = useParams();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('account');
    const [advisorData, setAdvisorData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [relatedData, setRelatedData] = useState({ allStudents: [], allPrograms: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ 1. เพิ่ม State สำหรับตรวจสอบการเปลี่ยนแปลง
    const [isDirty, setIsDirty] = useState(false);

 // ✅✅✅ แก้ไข useEffect นี้ทั้งหมด ✅✅✅
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [advisorsRes, studentsRes, programsRes] = await Promise.all([
                    fetch('/data/advisor.json'),
                    fetch('/data/student.json'),
                    fetch('/data/structures/programs.json') 
                ]);

                if (!advisorsRes.ok || !studentsRes.ok || !programsRes.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลพื้นฐานได้');
                }

                const advisorsFromFile = await advisorsRes.json();
                const allStudents = await studentsRes.json();
                const allPrograms = await programsRes.json();

                // 1. อ่านข้อมูลทั้งหมดจาก Local Storage (ถ้ามี)
                const savedAdvisors = JSON.parse(localStorage.getItem('savedAdvisors'));

                // 2. หาข้อมูลอาจารย์คนปัจจุบัน
                let currentAdvisor;
                if (savedAdvisors) {
                    // ถ้ามีข้อมูลใน Storage, ให้หาจากใน Storage ก่อน
                    currentAdvisor = savedAdvisors.find(a => a.advisor_id === advisorId);
                }
                
                if (!currentAdvisor) {
                    // ถ้าไม่เจอใน Storage (หรือไม่มี Storage), ให้หาจากไฟล์
                    currentAdvisor = advisorsFromFile.find(a => a.advisor_id === advisorId);
                }

                if (!currentAdvisor) {
                    throw new Error("ไม่พบข้อมูลอาจารย์");
                }

                // 3. ตั้งค่าข้อมูลเริ่มต้นเหมือนเดิม
                const advisorWithDefaults = {
                    ...currentAdvisor,
                    roles: currentAdvisor.roles || [],
                    assigned_programs: currentAdvisor.assigned_programs || [],
                    academic_works: currentAdvisor.academic_works || [],
                    password: '',
                    confirm_password: '',
                    gender_other: currentAdvisor.gender_other || '' // ✅ เพิ่มบรรทัดนี้
                };
                
                setAdvisorData(advisorWithDefaults);
                setOriginalData(_.cloneDeep(advisorWithDefaults));
                setRelatedData({ allStudents, allPrograms });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [advisorId]);

    // ✅ 2. เพิ่ม useEffect สำหรับเปรียบเทียบข้อมูล
    useEffect(() => {
        if (originalData && advisorData) {
            // ใช้ lodash ในการเปรียบเทียบ object/array ที่ซับซ้อน
            const hasChanges = !_.isEqual(originalData, advisorData);
            setIsDirty(hasChanges);
        }
    }, [advisorData, originalData]);

    // ✅ 3. เพิ่ม useEffect สำหรับดักจับการปิดหน้า/รีเฟรช
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.preventDefault();
                // Browser ส่วนใหญ่จะไม่แสดงข้อความที่เรากำหนด แต่จะใช้ข้อความมาตรฐานแทน
                event.returnValue = ''; 
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function: ลบ event listener ออกเมื่อ component ถูก unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]); // ให้ effect นี้ทำงานใหม่เมื่อ isDirty เปลี่ยนแปลง


    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setAdvisorData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleArrayChange = useCallback((fieldName, newArray) => {
        setAdvisorData(prev => ({ ...prev, [fieldName]: newArray }));
    }, []);

    const handleSave = () => {
        console.log("Saving data:", advisorData);
        
        let allAdvisors = JSON.parse(localStorage.getItem('savedAdvisors') || '[]');
        const index = allAdvisors.findIndex(a => a.advisor_id === advisorId);

        if (index > -1) {
            allAdvisors[index] = advisorData;
        } else {
            allAdvisors.push(advisorData);
        }

        localStorage.setItem('savedAdvisors', JSON.stringify(allAdvisors));
        
        // ✅ 4. อัปเดต originalData และ isDirty หลังบันทึก
        setOriginalData(_.cloneDeep(advisorData)); 
        setIsDirty(false); // ตั้งค่ากลับเป็น false เพราะบันทึกแล้ว
        
        alert("บันทึกข้อมูลอาจารย์สำเร็จ");
    };
    
    // ✅ 5. สร้างฟังก์ชันใหม่สำหรับจัดการการนำทาง
    const handleNavigation = (path) => {
        if (isDirty) {
            if (window.confirm("คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?")) {
                navigate(path);
            }
        } else {
            navigate(path);
        }
    };

    const renderSection = () => {
        if (!advisorData) return null;
        switch (activeSection) {
            case 'account': return <AccountSection data={advisorData} onInputChange={handleInputChange} />;
            case 'info': return <InfoSection data={advisorData} onInputChange={handleInputChange} />;
            case 'roles': return <RolesSection data={advisorData} onArrayChange={handleArrayChange} onInputChange={handleInputChange} allPrograms={relatedData.allPrograms} />;
            case 'advisees': return <AdviseesSection advisorId={advisorId} allStudents={relatedData.allStudents} />;
            case 'publications': return <PublicationsSection data={advisorData} onArrayChange={handleArrayChange} />;
            default: return <AccountSection data={advisorData} onInputChange={handleInputChange} />;
        }
    };

    if (loading) return <div className={detailStyles.pageContainer}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div className={detailStyles.pageContainer}>เกิดข้อผิดพลาด: {error}</div>;
    if (!advisorData) return <div className={detailStyles.pageContainer}>ไม่พบข้อมูล</div>;

    return (
        <div className={detailStyles.pageLayout}>
            {/* ✅ 6. เปลี่ยน onClick ของปุ่ม Back ให้ใช้ handleNavigation */}
            <Sidebar 
                advisor={advisorData} 
                activeSection={activeSection} 
                setActiveSection={setActiveSection} 
                onBack={() => handleNavigation('/admin/manage-users')} 
            />
            <main className={detailStyles.mainContent}>
                <div className={detailStyles.contentHeader}>
                    <h1><FontAwesomeIcon icon={faUserTie} /> จัดการข้อมูลอาจารย์</h1>
                    {/* ✅ 7. (ทางเลือก) ทำให้ปุ่มบันทึกกดไม่ได้ถ้าไม่มีการเปลี่ยนแปลง */}
                    <button 
                        className={styles.btnPrimary} 
                        onClick={handleSave}
                        disabled={!isDirty}
                    >
                        <FontAwesomeIcon icon={faSave} /> บันทึกการเปลี่ยนแปลงทั้งหมด
                    </button>
                </div>
                {renderSection()}
            </main>
        </div>
    );
}

export default ManageAdvisorDetailPage;