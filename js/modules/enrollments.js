document.addEventListener('DOMContentLoaded', () => {
  loadEnrollments();
  loadStudents();
  loadCourses();
});

/* ==========================================
   LOAD ENROLLMENTS
========================================== */
async function loadEnrollments() {
  const enrollments = await apiRequest('/api/enrollments');
  if (!enrollments) return;

  const tbody = document.getElementById('enrollmentTableBody');
  tbody.innerHTML = '';

  enrollments.forEach((e) => {
    tbody.innerHTML += `
      <tr>
        <td>${e.student_name}</td>
        <td>${e.subject_name}</td>
        <td>${e.school_year || '-'}</td>
        <td>${e.semester}</td>
        <td>
          <button class="btn btn-sm btn-danger"
            onclick="deleteEnrollment('${e.id}')">
            Remove
          </button>
        </td>
      </tr>
    `;
  });
}

/* ==========================================
   LOAD STUDENTS
========================================== */
async function loadStudents() {
  const students = await apiRequest('/api/students');
  if (!students) return;

  const select = document.getElementById('enrollmentStudent');
  select.innerHTML = '<option value="">Select Student</option>';

  students.forEach((s) => {
    select.innerHTML += `
      <option value="${s.id}">
        ${s.full_name}
      </option>
    `;
  });
}

/* ==========================================
   LOAD COURSES
========================================== */
async function loadCourses() {
  const courses = await apiRequest('/api/courses');
  if (!courses) return;

  const select = document.getElementById('enrollmentCourse');
  select.innerHTML = '<option value="">Select Course</option>';

  courses.forEach((c) => {
    select.innerHTML += `
      <option value="${c.id}">
        ${c.name}
      </option>
    `;
  });
}

/* ==========================================
   SAVE ENROLLMENT
========================================== */
async function saveEnrollment() {
  const student_id = document.getElementById('enrollmentStudent').value;
  const course_id = document.getElementById('enrollmentCourse').value;
  const year_level = document.getElementById('enrollmentYearLevel').value;
  const semester = document.getElementById('enrollmentSemester').value;

  if (!student_id || !course_id || !year_level || !semester) {
    alert('Please complete all fields.');
    return;
  }

  const result = await apiRequest('/api/enrollments', 'POST', {
    student_id,
    course_id,
    year_level,
    semester,
  });

  if (result) {
    alert(result.message);

    bootstrap.Modal.getInstance(
      document.getElementById('enrollmentModal')
    ).hide();

    loadEnrollments();
  }
}

/* ==========================================
   DELETE ENROLLMENT
========================================== */
async function deleteEnrollment(id) {
  if (!confirm('Remove enrollment?')) return;

  await apiRequest(`/api/enrollments/${id}`, 'DELETE');
  loadEnrollments();
}

/* ==========================================
   OPEN MODAL
========================================== */
function openEnrollmentModal() {
  const modal = new bootstrap.Modal(document.getElementById('enrollmentModal'));
  modal.show();
}
