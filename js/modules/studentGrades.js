document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(API_URL + '/api/grades/student/me', {
      headers: { Authorization: 'Bearer ' + token },
    });

    if (!res.ok) {
      console.error('Failed to load grades:', res.status);
      return;
    }

    const grades = await res.json();
    const tbody = document.getElementById('gradesTableBody');
    tbody.innerHTML = '';

    if (!grades || grades.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center">No grades available.</td>
        </tr>
      `;
      return;
    }

    grades.forEach((g) => {
      // ✅ Correct structure based on new backend
      const subject = g.subject_offerings?.subjects?.name || '-';

      const semester = g.subject_offerings?.semester || '-';

      const finalGrade = g.grades?.final_grade ?? '-';

      const status = g.grades?.status || '-';

      tbody.innerHTML += `
        <tr>
          <td>${subject}</td>
          <td>Semester ${semester}</td>
          <td>${finalGrade}</td>
          <td>${status}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error loading grades:', err);
  }
});
