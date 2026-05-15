document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(API_URL + '/api/attendance/student/me', {
      headers: { Authorization: 'Bearer ' + token },
    });

    if (!res.ok) {
      console.error('Failed to load attendance:', res.status);
      return;
    }

    const attendance = await res.json();

    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';

    if (!attendance || attendance.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center">No attendance records.</td>
        </tr>
      `;
      return;
    }

    attendance.forEach((a) => {
      const subject =
        a.offering_enrollments?.subject_offerings?.subjects?.name || '-';

      tbody.innerHTML += `
        <tr>
          <td>${subject}</td>
          <td>${a.attendance_date}</td>
          <td>${a.status}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error loading attendance:', err);
  }
});
