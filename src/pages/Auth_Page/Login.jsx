import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import logo from '../../assets/images/logo.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    async function fetchAllUsers() {
      const roles = [
        { file: "student.json", role: "student" },
        { file: "admin.json", role: "admin" },
        { file: "advisor.json", role: "advisor" },
      ];
      const allUsers = {};
      for (const roleItem of roles) {
        try {
          const response = await fetch(`/data/${roleItem.file}`);
          if (response.ok) {
            const data = await response.json();
            data.forEach(user => {
              if (user && typeof user.email === 'string') {
                allUsers[user.email.toLowerCase()] = { ...user, role: roleItem.role };
              }
            });
          }
        } catch (error) {
          console.error(`Error processing ${roleItem.file}:`, error);
        }
      }
      return allUsers;
    }

    const users = await fetchAllUsers();
    const formattedEmail = email.toLowerCase().trim();

    if (!users[formattedEmail]) {
      setError("❌ ไม่พบบัญชีนี้ในระบบ!");
      return;
    }

    if (users[formattedEmail].password !== password) {
      setError("❌ รหัสผ่านไม่ถูกต้อง!");
      return;
    }

  const currentUser = users[formattedEmail];
    localStorage.setItem("current_user", formattedEmail);
    localStorage.setItem("role", currentUser.role);
    const userFullName = `${currentUser.prefix_th || ''}${currentUser.first_name_th || currentUser.fullname || ''} ${currentUser.last_name_th || ''}`.trim();
    localStorage.setItem("current_user_name", userFullName);
    localStorage.setItem("student_id", currentUser.student_id);

    const userRole = currentUser.role;

    if (userRole === 'admin') {
      // ถ้าเป็น Admin ให้ไปหน้าหลักของ Admin เลย
      navigate('/admin'); 
    } else if (userRole === 'student' || userRole === 'advisor') {
      // ถ้าเป็น Student หรือ Advisor ให้เช็คว่าเคยเซ็นชื่อหรือยัง
      const hasSigned = localStorage.getItem(`${formattedEmail}_signed`) === "true";
      if (hasSigned) {
        // ถ้าเคยเซ็นแล้ว ให้ไปหน้า Home ของ Role นั้นๆ
        navigate(`/${userRole}/home`);
      } else {
        // ถ้ายังไม่เคยเซ็น ให้ไปหน้าตั้งค่าลายเซ็น
        navigate('/signature');
      }
    } else {
      // สำหรับ Role อื่นๆ ที่อาจมีในอนาคต หรือกรณีที่ไม่ตรงเงื่อนไข
      setError("ไม่สามารถกำหนดหน้าถัดไปสำหรับบทบาทของคุณได้");
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <img src={logo} alt="KMITL Logo" className={styles.logo} />
          <h1>Graduate Student Tracking System</h1>
          <p>เข้าสู่ระบบด้วยบัญชี <strong>@kmitl.ac.th</strong> เท่านั้น</p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email สถาบัน</label>
              <input
                type="email"
                id="email"
                placeholder="Email สถาบัน"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                type="password"
                id="password"
                placeholder="รหัสผ่าน"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit">🚀 เข้าสู่ระบบ</button>
            {error && <p className={styles.errorMsg}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

