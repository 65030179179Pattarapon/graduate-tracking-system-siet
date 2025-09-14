import React, { useState, useRef, useEffect } from 'react'; // 1. เพิ่ม useRef และ useEffect
import './guide.css';

function GuidePage() {
    // --- State Management ---
    const [openAccordionIndex, setOpenAccordionIndex] = useState(null);
    const [contactForm, setContactForm] = useState({ topic: '', subject: '', details: '' });
    
    // State และ Ref สำหรับจัดการไฟล์
    const [contactFile, setContactFile] = useState(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null); // 2. State ใหม่สำหรับเก็บ URL พรีวิว
    const fileInputRef = useRef(null); // 3. Ref สำหรับอ้างอิงถึง input element

    // --- Memory Management ---
    // useEffect สำหรับล้าง Object URL เก่าออกจากหน่วยความจำเมื่อ component ถูก unmount หรือเมื่อมีการเลือกไฟล์ใหม่
    useEffect(() => {
        // Cleanup function นี้จะถูกเรียกเมื่อ component ถูกทำลาย หรือก่อนที่ effect จะรันอีกครั้ง
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]); // Effect นี้จะทำงานทุกครั้งที่ filePreviewUrl เปลี่ยนแปลง

    // --- Event Handlers ---
    const handleAccordionClick = (index) => {
        setOpenAccordionIndex(openAccordionIndex === index ? null : index);
    };

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        setContactForm(prevForm => ({ ...prevForm, [id]: value }));
    };

    // 4. อัปเดตฟังก์ชันจัดการไฟล์ใหม่ทั้งหมด
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        // หากมี URL พรีวิวเก่าอยู่ ให้ล้างออกก่อน
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
        }

        if (file) {
            setContactFile(file);
            setFilePreviewUrl(URL.createObjectURL(file)); // สร้าง URL พรีวิวสำหรับไฟล์ที่เลือก
        } else {
            // กรณีผู้ใช้กด cancel
            setContactFile(null);
            setFilePreviewUrl(null);
        }
    };

    // 5. สร้างฟังก์ชันใหม่สำหรับลบไฟล์
    const handleRemoveFile = () => {
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl); // ล้าง URL ออกจากหน่วยความจำ
        }
        setContactFile(null);
        setFilePreviewUrl(null);
        // รีเซ็ตค่าใน input element โดยตรงผ่าน ref
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!contactForm.topic || !contactForm.subject || !contactForm.details) {
            alert("กรุณากรอกข้อมูลในช่อง ประเภท, หัวข้อ, และรายละเอียดให้ครบถ้วน");
            return;
        }
        const formData = {
            userEmail: localStorage.getItem("current_user") || 'N/A',
            pageUrl: window.location.href,
            timestamp: new Date().toISOString(),
            ...contactForm,
            fileName: contactFile ? contactFile.name : null
        };
        
        console.log("Contact Form Submitted:", formData);
        alert("✅ ได้รับข้อความของคุณแล้ว เจ้าหน้าที่จะติดต่อกลับ (ถ้าจำเป็น) ขอบคุณครับ");

        // 6. อัปเดตการรีเซ็ตฟอร์ม
        setContactForm({ topic: '', subject: '', details: '' });
        handleRemoveFile(); // เรียกใช้ฟังก์ชันลบไฟล์เพื่อรีเซ็ตทั้งหมด
    };

    // --- JSX Rendering ---
    return (
        <main className="page-container">
            {/* ... ส่วนของ Accordion เหมือนเดิม ... */}
            <h1><i className="fas fa-book-open"></i> คู่มือการใช้งานระบบ</h1>

            {/* หมวดหมู่ที่ 1: เริ่มต้นใช้งาน */}
            <div className="guide-category">
                <h2 className="category-title">🚀 เริ่มต้นใช้งานระบบ</h2>
                <div className="accordion">
                    <div> {/* ห่อแต่ละ item เพื่อให้ border-bottom ทำงานถูกต้อง */}
                        <button className={`accordion-btn ${openAccordionIndex === 0 ? 'active' : ''}`} onClick={() => handleAccordionClick(0)}>
                            การตั้งค่าโปรไฟล์และลายเซ็นดิจิทัล
                        </button>
                        <div className={`accordion-panel ${openAccordionIndex === 0 ? 'open' : ''}`}>
                            <p>ก่อนการยื่นเอกสารครั้งแรก นักศึกษาจำเป็นต้องตั้งค่าข้อมูลโปรไฟล์และลายเซ็นดิจิทัลให้เรียบร้อย เพื่อให้ข้อมูลในเอกสารของท่านถูกต้องและสมบูรณ์ โดยลายเซ็นดิจิทัลที่ตั้งค่าไว้จะถูกนำไปใช้ในการรับรองเอกสารทุกฉบับที่ท่านยื่นผ่านระบบโดยอัตโนมัติ</p>
                        </div>
                    </div>
                    <div>
                        <button className={`accordion-btn ${openAccordionIndex === 1 ? 'active' : ''}`} onClick={() => handleAccordionClick(1)}>
                            ทำความเข้าใจหน้าสถานะเอกสาร
                        </button>
                        <div className={`accordion-panel ${openAccordionIndex === 1 ? 'open' : ''}`}>
                            <p>ท่านสามารถติดตามความคืบหน้าของเอกสารทุกฉบับได้ที่หน้า "สถานะเอกสาร" ซึ่งจะแบ่งออกเป็น 3 คอลัมน์หลัก:</p>
                            <ul>
                                <li><b>กำลังดำเนินการ:</b> เอกสารที่ท่านเพิ่งยื่นและกำลังรอการตรวจสอบจากเจ้าหน้าที่หรืออาจารย์</li>
                                <li><b>อนุมัติแล้ว:</b> เอกสารที่ผ่านการตรวจสอบและอนุมัติครบทุกขั้นตอนแล้ว</li>
                                <li><b>ไม่อนุมัติ / ต้องแก้ไข:</b> เอกสารที่ถูกส่งกลับเนื่องจากข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน ท่านสามารถคลิกที่รายการเอกสารเพื่อดู "ความคิดเห็น" และดำเนินการแก้ไขต่อไป</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* หมวดหมู่ที่ 2: เส้นทางสู่การสำเร็จการศึกษา */}
            <div className="guide-category">
                <h2 className="category-title">🎓 เส้นทางสู่การสำเร็จการศึกษา</h2>
                <div className="accordion">
                     <div>
                        <button className={`accordion-btn ${openAccordionIndex === 2 ? 'active' : ''}`} onClick={() => handleAccordionClick(2)}>
                            ภาพรวมกระบวนการทั้งหมด
                        </button>
                        <div className={`accordion-panel ${openAccordionIndex === 2 ? 'open' : ''}`}>
                            <p>กระบวนการทำวิทยานิพนธ์ในระบบดิจิทัลถูกแบ่งออกเป็น 2 ขั้นตอนหลัก ท่านต้องดำเนินการตามลำดับเพื่อให้การยื่นเอกสารเป็นไปอย่างราบรื่น</p>
                            <ol>
                                <li><b>ขั้นตอนการสอบหัวข้อและเค้าโครงวิทยานิพนธ์:</b> เริ่มตั้งแต่การเลือกอาจารย์ที่ปรึกษาไปจนถึงการได้รับอนุมัติหัวข้อวิจัย</li>
                                <li><b>ขั้นตอนการสอบวิทยานิพนธ์ขั้นสุดท้าย:</b> เริ่มตั้งแต่การยื่นคำร้องขอสอบไปจนถึงการได้รับอนุมัติให้สำเร็จการศึกษา</li>
                            </ol>
                        </div>
                    </div>
                    <div>
                        <button className={`accordion-btn ${openAccordionIndex === 3 ? 'active' : ''}`} onClick={() => handleAccordionClick(3)}>
                            ขั้นตอนที่ 1: การยื่นสอบหัวข้อและเค้าโครง
                        </button>
                        <div className={`accordion-panel ${openAccordionIndex === 3 ? 'open' : ''}`}>
                            <p>ในขั้นตอนนี้ นักศึกษาต้องดำเนินการยื่นฟอร์มตามลำดับดังนี้:</p>
                            <ul>
                                <li><b>ฟอร์ม 1:</b> ขอรับรองการเป็นอาจารย์ที่ปรึกษา</li>
                                <li><b>ฟอร์ม 2:</b> เสนอหัวข้อและเค้าโครงวิทยานิพนธ์</li>
                                <li><b>ฟอร์ม 3:</b> นำส่งเอกสารเค้าโครงฯ ฉบับสมบูรณ์ (หลังจากฟอร์ม 2 ได้รับการอนุมัติ)</li>
                                <li><b>ฟอร์ม 4 และ 5:</b> ขอหนังสือเชิญผู้ทรงคุณวุฒิ และ ขออนุญาตเก็บข้อมูล (ยื่นเมื่อจำเป็น)</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <button className={`accordion-btn ${openAccordionIndex === 4 ? 'active' : ''}`} onClick={() => handleAccordionClick(4)}>
                            ขั้นตอนที่ 2: การยื่นสอบวิทยานิพนธ์ขั้นสุดท้าย
                        </button>
                        <div className={`accordion-panel ${openAccordionIndex === 4 ? 'open' : ''}`}>
                             <p>หลังจากดำเนินการในขั้นตอนแรกและทำการวิจัยเสร็จสิ้นแล้ว นักศึกษาต้องดำเนินการในขั้นตอนสุดท้ายดังนี้:</p>
                             <ul>
                                 <li><b>ยื่นผลสอบภาษาอังกฤษ:</b> ต้องมีสถานะ "ผ่านเกณฑ์" ก่อนจึงจะยื่นขอสอบได้</li>
                                 <li><b>ฟอร์ม 6:</b> ขอแต่งตั้งคณะกรรมการสอบวิทยานิพนธ์ขั้นสุดท้าย พร้อมแนบเอกสารประกอบทั้งหมดผ่านระบบ</li>
                             </ul>
                             <p>หลังจากยื่นฟอร์ม 6 แล้ว ให้รอการแจ้งกำหนดวันและเวลาสอบจากทางบัณฑิตวิทยาลัยผ่านทางหน้า "สถานะเอกสาร"</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* หมวดหมู่ที่ 3: คำถามที่พบบ่อย (FAQ) */}
            <div className="guide-category">
                <h2 className="category-title">❓ คำถามที่พบบ่อย (FAQ)</h2>
                <div className="accordion">
                    <div>
                        <button className={`accordion-btn ${openAccordionIndex === 5 ? 'active' : ''}`} onClick={() => handleAccordionClick(5)}>
                            เอกสารถูกตีกลับให้แก้ไข ควรทำอย่างไร?
                        </button>
                        <div className={`accordion-panel ${openAccordionIndex === 5 ? 'open' : ''}`}>
                            <p>ไปที่หน้า "สถานะเอกสาร" และคลิกที่รายการเอกสารในคอลัมน์ "ไม่อนุมัติ / ต้องแก้ไข" เพื่อดูความคิดเห็นจากเจ้าหน้าที่ จากนั้นให้กลับไปที่หน้า "กรอกแบบฟอร์ม" เพื่อยื่นเอกสารฉบับที่ถูกต้องอีกครั้ง</p>
                        </div>
                    </div>
                    <div>
                        <button className={`accordion-btn ${openAccordionIndex === 6 ? 'active' : ''}`} onClick={() => handleAccordionClick(6)}>
                            จะดาวน์โหลดเอกสารที่อนุมัติแล้วได้ที่ไหน?
                        </button>
                        <div className={`accordion-panel ${openAccordionIndex === 6 ? 'open' : ''}`}>
                            <p>ท่านสามารถไปที่หน้า "ดาวน์โหลดเอกสาร" และดูที่ตาราง "เอกสารฉบับสมบูรณ์ของคุณ" เอกสารที่ผ่านการอนุมัติทั้งหมดจะปรากฏที่นี่เพื่อให้ท่านดาวน์โหลดเป็นไฟล์ PDF ได้</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="guide-category">
                <h2 className="category-title">💬 แจ้งปัญหาการใช้งาน / สอบถาม</h2>
                {/* ในไฟล์ GuidePage.jsx - มองหาส่วน <form> แล้วแทนที่ */}
                <form id="contact-form" onSubmit={handleFormSubmit}>
                    <fieldset>
                        {/* ส่วน input อื่นๆ จะยังอยู่ใน fieldset หลัก */}
                        <div className="form-group">
                            <label htmlFor="topic">ประเภทของเรื่อง*</label>
                            <select id="topic" required value={contactForm.topic} onChange={handleFormChange}>
                                <option value="">-- กรุณาเลือก --</option>
                                <option value="คำถามการใช้งาน">คำถามเกี่ยวกับการใช้งาน</option>
                                <option value="รายงานปัญหา">รายงานปัญหา / บั๊กของระบบ</option>
                                <option value="ข้อเสนอแนะ">ข้อเสนอแนะเพื่อการพัฒนา</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject">หัวข้อ*</label>
                            <input type="text" id="subject" placeholder="สรุปปัญหาหรือคำถามของคุณสั้นๆ" required value={contactForm.subject} onChange={handleFormChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="details">รายละเอียด*</label>
                            <textarea id="details" rows="5" placeholder="กรุณาอธิบายรายละเอียดของปัญหาที่พบ..." required value={contactForm.details} onChange={handleFormChange}></textarea>
                        </div>

                        {/* -->> แก้ไขตรงนี้: เพิ่ม fieldset ใหม่สำหรับส่วนแนบไฟล์ <<-- */}
                        <fieldset className="file-upload-fieldset">
                            <legend>
                                <i className="fas fa-paperclip"></i>
                                แนบไฟล์ภาพประกอบ (ถ้ามี)
                            </legend>

                            {/* Input type="file" ที่ถูกซ่อนไว้ */}
                            <input
                                type="file"
                                id="contact-file"
                                className="file-input-hidden"
                                accept="image/png, image/jpeg"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                            />
                            
                            {/* ปุ่ม "เลือกไฟล์..." */}
                            {!contactFile && (
                                <label htmlFor="contact-file" className="custom-file-upload-btn">
                                    เลือกไฟล์...
                                </label>
                            )}

                            {/* ส่วนแสดงผลไฟล์ที่เลือก */}
                            {contactFile && (
                                <div className="file-display-wrapper">
                                    <a href={filePreviewUrl} target="_blank" rel="noopener noreferrer" className="file-preview-link">
                                        <i className="fas fa-image"></i>
                                        {contactFile.name}
                                    </a>
                                    <button type="button" onClick={handleRemoveFile} className="remove-file-btn" title="ลบไฟล์">
                                        &times;
                                    </button>
                                </div>
                            )}
                        </fieldset>
                        
                        <button type="submit" className="submit-contact-btn">ส่งข้อความ</button>
                    </fieldset>
                </form>
            </div>
        </main>
    );
}

export default GuidePage;