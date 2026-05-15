let gradeModal;
let isEditMode = false;
let allGrades = [];
let allStudents = [];
let allOfferings = [];

document.addEventListener('DOMContentLoaded', () => {
  gradeModal = new bootstrap.Modal(document.getElementById('gradeModal'));
  loadStudents();
  loadOfferings();
  loadGrades();
  initializeSearch();
});

/* ======================================================
   LOAD GRADES
====================================================== */
async function loadGrades() {
  const grades = await apiRequest('/api/grades');
  if (!grades) return;

  allGrades = grades;
  renderGrades(grades);
}

/* ======================================================
   RENDER TABLE (ALIGNED WITH NORMALIZED STRUCTURE)
====================================================== */
function renderGrades(grades) {
  const table = document.getElementById('gradeTable');
  table.innerHTML = '';

  grades.forEach((g) => {
    const student = g.offering_enrollments?.students
      ? `${g.offering_enrollments.students.first_name} ${g.offering_enrollments.students.last_name}`
      : '-';

    const subject =
      g.offering_enrollments?.subject_offerings?.subjects?.name || '-';

    const score = g.final_grade ?? '-';

    table.innerHTML += `
      <tr>
        <td>${student}</td>
        <td>${subject}</td>
        <td>${score}</td>
        <td>
          ${getGradeStatus(score)}
        </td>
        <td>
          ${
            g.is_locked
              ? `<button class="btn btn-sm btn-warning"
                    onclick="unlockGrade('${g.id}')">
                    Unlock
                 </button>`
              : `<span class="badge bg-secondary">Unlocked</span>`
          }
        </td>
      </tr>
    `;
  });
}

/* ======================================================
   LOAD STUDENTS (FOR MODAL)
====================================================== */
async function loadStudents() {
  const students = await apiRequest('/api/students');
  if (!students) return;

  allStudents = students;

  const select = document.getElementById('studentSelect');
  select.innerHTML = '<option value="">Select Student</option>';

  students.forEach((s) => {
    select.innerHTML += `
      <option value="${s.id}">
        ${s.full_name || s.first_name + ' ' + s.last_name}
      </option>
    `;
  });
}

/* ======================================================
   LOAD SUBJECT OFFERINGS (FOR MODAL)
====================================================== */
async function loadOfferings() {
  const offerings = await apiRequest('/api/subject-offerings');
  if (!offerings) return;

  allOfferings = offerings;

  const select = document.getElementById('subjectSelect');
  select.innerHTML = '<option value="">Select Subject Offering</option>';

  offerings.forEach((o) => {
    select.innerHTML += `
      <option value="${o.id}">
        ${o.subject_name} - ${o.school_year}
      </option>
    `;
  });
}

/* ======================================================
   SEARCH
====================================================== */
function initializeSearch() {
  const searchInput = document.getElementById('gradeSearch');
  if (!searchInput) return;

  searchInput.addEventListener('keyup', function () {
    const keyword = this.value.toLowerCase();

    const filtered = allGrades.filter((g) => {
      const student = g.offering_enrollments?.students
        ? `${g.offering_enrollments.students.first_name} ${g.offering_enrollments.students.last_name}`.toLowerCase()
        : '';

      const subject =
        g.offering_enrollments?.subject_offerings?.subjects?.name?.toLowerCase() ||
        '';

      return student.includes(keyword) || subject.includes(keyword);
    });

    renderGrades(filtered);
  });
}

/* ======================================================
   UNLOCK GRADE (ADMIN)
====================================================== */
async function unlockGrade(id) {
  if (!confirm('Unlock this grade?')) return;

  await apiRequest(`/api/grades/unlock/${id}`, 'POST');

  loadGrades();
}

/* ======================================================
   STATUS BADGE
====================================================== */
function getGradeStatus(score) {
  if (score === '-' || score === null) {
    return '<span class="badge bg-secondary">N/A</span>';
  }

  return score >= 75
    ? '<span class="badge bg-success">Passed</span>'
    : '<span class="badge bg-danger">Failed</span>';
}

/* ======================================================
   LOGOUT
====================================================== */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/index.html');
  }
}
