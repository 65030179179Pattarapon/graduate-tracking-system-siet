import React, { useState, useEffect } from 'react';
import './Templates.css'; // นำเข้าไฟล์ CSS ที่เราจะสร้างในขั้นตอนถัดไป

// ฟังก์ชันสำหรับจัดรูปแบบวันที่ (สามารถแยกไปไฟล์ utility ได้)
function formatThaiDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function TemplatesPage() {
    // --- State Management ---
    // State สำหรับเก็บรายการฟอร์มเปล่า
    const [templates, setTemplates] = useState([]);
    // State สำหรับเก็บเอกสารฉบับสมบูรณ์ของผู้ใช้
    const [completedDocs, setCompletedDocs] = useState([]);
    // State สำหรับจัดการสถานะการโหลดข้อมูล
    const [isLoading, setIsLoading] = useState(true);
    // State สำหรับจัดการข้อผิดพลาด
    const [error, setError] = useState(null);

    // --- Data Fetching ---
    // useEffect จะทำงานเพียงครั้งเดียวหลังจาก component ถูก render ครั้งแรก (เหมือน DOMContentLoaded)
    useEffect(() => {
        // สร้างฟังก์ชัน async ภายใน useEffect เพื่อดึงข้อมูล
        const loadTemplateData = async () => {
            try {
                // ตรวจสอบผู้ใช้จาก localStorage (เหมือนโค้ดเดิม)
                const userEmail = localStorage.getItem("current_user");
                if (!userEmail) {
                    // ใน React เราจะใช้เครื่องมือ routing เพื่อเปลี่ยนหน้า ไม่ใช่ window.location.href โดยตรง
                    // แต่เพื่อความง่าย จะยังคงใช้แบบเดิมไปก่อน
                    // window.location.href = "/login/index.html";
                    console.warn("User not logged in. Redirecting...");
                    return;
                }
                
                // --- 1. โหลด Template ฟอร์มเปล่า ---
                const templatesResponse = await fetch("/data/templates.json");
                if (!templatesResponse.ok) throw new Error('Failed to fetch templates.json');
                const templatesData = await templatesResponse.json();
                setTemplates(templatesData); // อัปเดต state ของ templates

                // --- 2. โหลดข้อมูลเอกสารฉบับสมบูรณ์ ---
                const [studentsResponse, dbApprovedResponse, localStorageApproved] = await Promise.all([
                    fetch("/data/templates.json"),
                    fetch("/data/student.json"),
                    fetch("/data/document_approved.json"),
                    Promise.resolve(JSON.parse(localStorage.getItem('localStorage_approvedDocs') || '[]'))
                ]);

                if (!studentsResponse.ok) throw new Error('Failed to fetch student.json');
                if (!dbApprovedResponse.ok) throw new Error('Failed to fetch document_approved.json');

                const students = await studentsResponse.json();
                const dbApproved = await dbApprovedResponse.json();
                
                const currentUser = students.find(s => s.email === userEmail);
                if (!currentUser) {
                    console.warn("Current user data not found in student.json");
                    setIsLoading(false); // หยุดโหลดแม้ไม่เจอข้อมูลนักเรียน
                    return;
                }
                
                // รวมข้อมูลเอกสารที่อนุมัติแล้วจากสองแหล่ง
                const combinedApproved = [...dbApproved, ...localStorageApproved];
                
                // คัดกรองเอกสารเฉพาะของผู้ใช้ปัจจุบัน
                const userCompletedDocs = combinedApproved.filter(doc => doc.student_id === currentUser.student_id || doc.student_email === userEmail);

                // เรียงลำดับเอกสารตามวันที่ล่าสุด
                userCompletedDocs.sort((a, b) => new Date(b.approved_date || b.submitted_date) - new Date(a.approved_date || a.submitted_date));

                setCompletedDocs(userCompletedDocs); // อัปเดต state ของ completedDocs

            } catch (err) {
                console.error("Failed to load template page data:", err);
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล"); // อัปเดต state ของ error
            } finally {
                setIsLoading(false); // ตั้งค่า isLoading เป็น false เมื่อโหลดเสร็จสิ้น (ไม่ว่าจะสำเร็จหรือล้มเหลว)
            }
        };

        loadTemplateData(); // เรียกใช้ฟังก์ชันดึงข้อมูล
    }, []); // dependency array ว่างเปล่า `[]` หมายถึงให้ useEffect นี้ทำงานแค่ครั้งเดียว

    // --- Conditional Rendering ---
    // จัดการการแสดงผลตาม state ต่างๆ
    if (error) {
        return <main className="page-container"><p style={{ color: 'red', textAlign: 'center' }}>{error}</p></main>;
    }

    // --- JSX Rendering ---
    // ส่วนนี้คือการ "ประกาศ" ว่าหน้าตาควรเป็นอย่างไร
    // React จะวาดหน้าจอตาม JSX ที่ return ออกไป
    return (
        <main className="page-container">
            <h1><i className="fas fa-download"></i> ดาวน์โหลดเอกสาร</h1>

            <section className="template-section">
                <h2 className="section-title">แบบฟอร์มเปล่า (Templates)</h2>
                <p className="section-description">สำหรับดาวน์โหลดเพื่อกรอกข้อมูลหรือดูเป็นตัวอย่าง</p>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>📄 ชื่อเอกสาร</th>
                                <th>ดาวน์โหลด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="2" className="loading-text">กำลังโหลดข้อมูล...</td></tr>
                            ) : templates.length === 0 ? (
                                <tr><td colSpan="2" className="loading-text">ไม่พบข้อมูลเทมเพลต</td></tr>
                            ) : (
                                templates.map((template, index) => (
                                    <tr key={`template-${index}`}> {/* key เป็น attribute สำคัญสำหรับ React เมื่อ render list */}
                                        <td>{template.name}</td>
                                        <td className="download-links">
                                            <a href={template.docx} title="ดาวน์โหลด .docx" download><i className="fas fa-file-word"></i></a>
                                            <a href={template.pdf} title="ดาวน์โหลด .pdf" download><i className="fas fa-file-pdf"></i></a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="template-section">
                <h2 className="section-title">เอกสารฉบับสมบูรณ์ของคุณ (Completed Documents)</h2>
                <p className="section-description">เอกสารที่ผ่านการอนุมัติครบทุกขั้นตอนแล้ว สามารถดาวน์โหลดเป็นไฟล์ PDF ได้</p>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>📑 ชื่อเอกสารที่ยื่น</th>
                                <th>วันที่อนุมัติล่าสุด</th>
                                <th>ดาวน์โหลด (PDF)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="3" className="loading-text">กำลังโหลดข้อมูล...</td></tr>
                            ) : completedDocs.length === 0 ? (
                                <tr><td colSpan="3" className="loading-text">ยังไม่มีเอกสารฉบับสมบูรณ์ที่ผ่านการอนุมัติ</td></tr>
                            ) : (
                                completedDocs.map((doc, index) => {
                                    const completedPdfLink = doc.link || '#';
                                    return (
                                        <tr key={`completed-${index}`}>
                                            <td>{doc.title}</td>
                                            <td>{formatThaiDate(doc.approved_date || doc.submitted_date)}</td>
                                            <td className="download-links">
                                                <a href={completedPdfLink} title="ดาวน์โหลด .pdf" download><i className="fas fa-file-pdf"></i></a>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}

export default TemplatesPage;