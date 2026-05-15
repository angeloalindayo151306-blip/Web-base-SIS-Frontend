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

  const table = document.getElementById('teacherGradeTable');
  table.innerHTML = '';

  if (!students || students.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">
          No enrolled students.
        </td>
      </tr>
    `;
    return;
  }

  students.forEach((s) => {
    const grade = s.grades?.[0] || {};
    const locked = grade.is_locked ? 'disabled' : '';

    table.innerHTML += `
      <tr>
        <td>${s.students.first_name} ${s.students.last_name}</td>

        <td>
          <input type="number" class="form-control prelim"
            min="0" max="100"
            value="${grade.prelim || ''}" ${locked}>
        </td>

        <td>
          <input type="number" class="form-control midterm"
            min="0" max="100"
            value="${grade.midterm || ''}" ${locked}>
        </td>

        <td>
          <input type="number" class="form-control finals"
            min="0" max="100"
            value="${grade.finals || ''}" ${locked}>
        </td>

        <td>${grade.final_grade || '-'}</td>
        <td>${grade.status || '-'}</td>

        <td>
          ${
            grade.is_locked
              ? `<span class="badge bg-secondary">Locked</span>`
              : `
              <button class="btn btn-success btn-sm"
                onclick="saveGrade('${s.id}', this)">
                Save
              </button>
              ${
                grade.id
                  ? `<button class="btn btn-warning btn-sm ms-1"
                    onclick="lockGrade('${grade.id}')">
                    Lock
                  </button>`
                  : ''
              }
            `
          }
        </td>
      </tr>
    `;
  });
}

/* ✅ Save Grade */
async function saveGrade(enrollmentId, btn) {
  const row = btn.closest('tr');

  const prelim = row.querySelector('.prelim').value;
  const midterm = row.querySelector('.midterm').value;
  const finals = row.querySelector('.finals').value;

  await apiRequest('/api/grades', 'POST', {
    offering_enrollment_id: enrollmentId,
    prelim,
    midterm,
    finals,
  });

  // ✅ Reload table after save
  loadStudents();
}

async function lockGrade(gradeId) {
  await apiRequest(`/api/grades/lock/${gradeId}`, 'POST');

  loadStudents();
}
