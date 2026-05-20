document.addEventListener('DOMContentLoaded', function () {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!user || user.role !== 'student') return;

  /* ==========================================
     PROFILE INFO
  ========================================== */
  document.getElementById('studentName').innerText = user.full_name;
  document.getElementById('studentEmail').innerText = user.email;
  document.getElementById('studentInitial').innerText = user.full_name
    .charAt(0)
    .toUpperCase();

  loadGrades();
  loadAttendance();

  /* ==========================================
     LOAD GRADES + GPA
  ========================================== */
  async function loadGrades() {
    try {
      const res = await fetch(API_URL + '/api/grades/student/me', {
        headers: { Authorization: 'Bearer ' + token },
      });

      if (!res.ok) {
        console.error('Grades fetch failed:', res.status);
        setAcademicDefaults();
        return;
      }

      const grades = await res.json();

      if (!grades || grades.length === 0) {
        setAcademicDefaults();
        return;
      }

      // ✅ Only count subjects with final grades
      const gradedSubjects = grades.filter(
        (g) => g.grades?.final_grade != null
      );

      const totalSubjects = gradedSubjects.length;

      if (totalSubjects === 0) {
        setAcademicDefaults();
        return;
      }

      const totalGrade = gradedSubjects.reduce((sum, g) => {
        return sum + Number(g.grades.final_grade);
      }, 0);

      const average = totalGrade / totalSubjects;
      const gpa = convertToGPA(average);

      let badge = '';
      if (gpa >= 3.5) {
        badge = `<span class="badge bg-success">🏆 Honors Student</span>`;
      } else if (gpa >= 3.0) {
        badge = `<span class="badge bg-primary">✅ Good Standing</span>`;
      } else if (gpa >= 2.0) {
        badge = `<span class="badge bg-warning text-dark">⚠️ Average</span>`;
      } else {
        badge = `<span class="badge bg-danger">❌ Academic Risk</span>`;
      }

      document.getElementById('totalSubjects').innerText = totalSubjects;
      document.getElementById('averageGrade').innerText = average.toFixed(2);
      document.getElementById('gpaValue').innerText = gpa.toFixed(2);
      document.getElementById('gpaBadge').innerHTML = badge;
    } catch (err) {
      console.error('Error loading grades:', err);
      setAcademicDefaults();
    }
  }

  function setAcademicDefaults() {
    document.getElementById('totalSubjects').innerText = 0;
    document.getElementById('averageGrade').innerText = '0.00';
    document.getElementById('gpaValue').innerText = '0.00';
    document.getElementById('gpaBadge').innerHTML = '';
  }

  /* ==========================================
     LOAD ATTENDANCE
  ========================================== */
  async function loadAttendance() {
    try {
      const res = await fetch(API_URL + '/api/attendance/student/me', {
        headers: { Authorization: 'Bearer ' + token },
      });

      if (!res.ok) {
        console.error('Attendance fetch failed:', res.status);
        setAttendanceDefault();
        return;
      }

      const attendance = await res.json();

      if (!attendance || attendance.length === 0) {
        setAttendanceDefault();
        return;
      }

      const totalDays = attendance.length;

      // ✅ Count present + late as valid attendance
      const validDays = attendance.filter((a) =>
        ['present', 'late'].includes(a.status?.trim().toLowerCase())
      ).length;

      const percent = (validDays / totalDays) * 100;

      const attendanceElement = document.getElementById('attendancePercent');

      attendanceElement.innerText = percent.toFixed(1) + '%';

      // ✅ Risk color for text
      attendanceElement.classList.remove('text-danger');
      if (percent < 75) {
        attendanceElement.classList.add('text-danger');
      }

      // ✅ UPDATE PROGRESS BAR
      const attendanceBar = document.getElementById('attendanceBar');

      if (attendanceBar) {
        attendanceBar.style.width = percent.toFixed(1) + '%';

        attendanceBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');

        if (percent >= 85) {
          attendanceBar.classList.add('bg-success');
        } else if (percent >= 75) {
          attendanceBar.classList.add('bg-warning');
        } else {
          attendanceBar.classList.add('bg-danger');
        }
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
      setAttendanceDefault();
    }
  }

  function setAttendanceDefault() {
    document.getElementById('attendancePercent').innerText = '0%';

    const attendanceBar = document.getElementById('attendanceBar');
    if (attendanceBar) {
      attendanceBar.style.width = '0%';
      attendanceBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
      attendanceBar.classList.add('bg-danger');
    }
  }

  async function loadQR() {
    try {
      const res = await fetch(API_URL + '/api/students/me/qr', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
  
      if (!res.ok) {
        console.error('Failed to load QR');
        return;
      }
  
      const data = await res.json();
  
      document.getElementById('studentQRImage').src = data.qr_image;
      document.getElementById('studentQRContainer').style.display = 'block';
  
    } catch (err) {
      console.error('Error loading QR:', err);
    }
  }

  /* ==========================================
     GPA CONVERSION
  ========================================== */
  function convertToGPA(avg) {
    if (avg >= 90) return 4.0;
    if (avg >= 85) return 3.5;
    if (avg >= 80) return 3.0;
    if (avg >= 75) return 2.5;
    return 0;
  }
});

