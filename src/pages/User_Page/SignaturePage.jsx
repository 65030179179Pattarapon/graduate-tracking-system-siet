import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-pad-wrapper';
import styles from './SignaturePage.module.css';
import logo from '../../assets/images/logo.png';

function SignaturePage() {
  const [activeTab, setActiveTab] = useState('draw');
  const [uploadedImage, setUploadedImage] = useState(null);
  const sigPad = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearCanvas = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
  };

  // --- ส่วนที่แก้ไข: ปรับปรุง Logic ทั้งหมด ---
  const submitSignature = () => {
    // 1. ตรวจสอบข้อมูลที่มีอยู่ โดยเช็ค Canvas อย่างปลอดภัย
    const isImageUploaded = !!uploadedImage;
    // เช็ค Canvas ก็ต่อเมื่อ ref พร้อมใช้งานแล้วเท่านั้น ถ้าไม่พร้อม ให้ถือว่าว่าง (true)
    const isCanvasEmpty = sigPad.current ? sigPad.current.isEmpty() : true;

    // 2. ตรวจสอบว่ามีข้อมูลอย่างน้อยหนึ่งอย่างหรือไม่
    if (isCanvasEmpty && !isImageUploaded) {
      alert("✍️ กรุณาวาดลายเซ็น หรือ อัปโหลดรูปภาพก่อนบันทึก");
      return;
    }

    let signatureData = null;
    let submissionType = 'signature';

    // 3. กำหนดว่าจะใช้ข้อมูลจากแหล่งไหน (Logic เดิมที่ปรับปรุงแล้ว)
    //    จัดลำดับความสำคัญตามแท็บที่ผู้ใช้เปิดอยู่
    if (activeTab === 'upload' && isImageUploaded) {
      signatureData = uploadedImage;
      submissionType = 'image';
    } else if (activeTab === 'draw' && !isCanvasEmpty) {
      signatureData = sigPad.current.toDataURL('image/png');
      submissionType = 'signature';
    } else if (isImageUploaded) { // กรณีสำรอง: ถ้าแท็บปัจจุบันว่าง ให้ใช้ข้อมูลจากอีกแท็บ
      signatureData = uploadedImage;
      submissionType = 'image';
    } else if (!isCanvasEmpty) { // กรณีสำรอง: ถ้าแท็บปัจจุบันว่าง ให้ใช้ข้อมูลจากอีกแท็บ
      signatureData = sigPad.current.toDataURL('image/png');
      submissionType = 'signature';
    }

    if (!signatureData) {
      alert("เกิดข้อผิดพลาด: ไม่สามารถดึงข้อมูลลายเซ็นได้ กรุณาลองอีกครั้ง");
      return;
    }

    // 4. บันทึกข้อมูลและไปต่อ
    const email = localStorage.getItem("current_user");
    const role = localStorage.getItem("role");
    if (!email || !role) {
      alert("⚠️ ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      navigate('/login');
      return;
    }

    localStorage.setItem(`${email}_signature_data`, signatureData);
    localStorage.setItem(`${email}_signed`, "true");

    const alertMessage = submissionType === 'image'
      ? "✅ รูปภาพของคุณถูกบันทึกแล้ว"
      : "✅ ลายเซ็นของคุณถูกบันทึกแล้ว";
    alert(alertMessage);

    navigate(`/${role}/home`);
  };
  // --- จบส่วนที่แก้ไข ---

  return (
    // ... ส่วน JSX ไม่มีการเปลี่ยนแปลง ...
    <div className={styles.signaturePageContainer}>
      <div className={styles.signatureCard}>
        <img src={logo} alt="โลโก้สถาบันฯ" className={styles.cardLogo} />
        <h2>✍️ ตั้งค่าลายเซ็นออนไลน์</h2>
        <p>กรุณาตั้งค่าลายเซ็นเพื่อใช้ในการยื่นเอกสารต่างๆ ในระบบ</p>
        <div className={styles.tabsContainer}>
          <button onClick={() => setActiveTab('draw')} className={`${styles.tabBtn} ${activeTab === 'draw' ? styles.active : ''}`}>✍️ วาดลายเซ็น</button>
          <button onClick={() => setActiveTab('upload')} className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.active : ''}`}>🖼️ อัปโหลดรูปภาพ</button>
        </div>
        {activeTab === 'draw' && (
          <div className={styles.tabContent}>
            <p className={styles.tabDescription}>ใช้นิ้วหรือเมาส์วาดลายเซ็นในกรอบด้านล่าง</p>
            <div className={styles.canvasContainer}>
              <SignaturePad ref={sigPad} options={{ penColor: 'black' }} canvasProps={{ className: styles.signatureCanvas }}/>
            </div>
            <button onClick={clearCanvas} type="button" className={styles.clearBtn}>ล้าง</button>
          </div>
        )}
        {activeTab === 'upload' && (
          <div className={styles.tabContent}>
            <p className={styles.tabDescription}>อัปโหลดไฟล์รูปภาพลายเซ็นของคุณ (.png, .jpg)</p>
            <div className={styles.imagePreviewContainer}>
              {uploadedImage ? (<img src={uploadedImage} alt="ตัวอย่างลายเซ็น" className={styles.signaturePreview} />) : (<span>ยังไม่มีรูปภาพ</span>)}
            </div>
            <div className={styles.uploadActions}>
              <label htmlFor="signature-file-input" className={styles.uploadBtnWrapper}>เลือกรูปภาพ</label>
              {uploadedImage && (<button onClick={handleRemoveImage} className={styles.removeBtn}>ลบรูปภาพ</button>)}
            </div>
            <input type="file" id="signature-file-input" ref={fileInputRef} accept="image/png, image/jpeg" onChange={handleFileSelect} style={{ display: 'none' }}/>
          </div>
        )}
        <div className={styles.actions}>
          <button onClick={submitSignature} type="button">✅ บันทึกและดำเนินการต่อ</button>
        </div>
      </div>
    </div>
  );
}

export default SignaturePage;