document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadOfferings();

  document
    .getElementById('offeringSelect')
    .addEventListener('change', loadStudents);
}

/* ✅ Load Teacher Classes */
async function loadOfferings() {
  const data = await apiRequest('/api/teachers/dashboard');
  if (!data || !data.classes) return;

  const select = document.getElementById('offeringSelect');

  data.classes.forEach((cls) => {
    select.innerHTML += `
      <option value="${cls.offering_id}">
        ${cls.subject} - Semester ${cls.semester}
      </option>
    `;
  });
}

/* ✅ Load Students Per Offering */
async function loadStudents() {
  const offeringId = document.getElementById('offeringSelect').value;
  if (!offeringId) return;

  const students = await apiRequest(
    `/api/teachers/offering/${offeringId}/students`
  );

  const table = document.getElementById('studentTable');
  table.innerHTML = '';

  if (!students || students.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          No enrolled students.
        </td>
      </tr>
    `;
    return;
  }

  students.forEach((s) => {
    const student = s.students;

    table.innerHTML += `
      <tr>
        <td>${student.first_name} ${student.last_name}</td>
        <td>${student.year_level || '-'}</td>
        <td>${student.block || '-'}</td>
        <td>${student.qr_code_value || '-'}</td>
      </tr>
    `;
  });
}
