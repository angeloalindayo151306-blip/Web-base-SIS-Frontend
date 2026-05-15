document.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  loadDepartments();
});

/* ==========================================
   LOAD COURSES
========================================== */
async function loadCourses() {
  const data = await apiRequest('/api/courses');
  if (!data) return;

  const tbody = document.getElementById('courseTableBody');
  tbody.innerHTML = '';

  data.forEach((c) => {
    tbody.innerHTML += `
      <tr>
        <td>${c.name}</td>
        <td>${c.department_name || '-'}</td>
        <td>
          <button class="btn btn-sm btn-secondary"
            onclick="openCurriculumModal('${c.id}', '${c.name}')">
            Curriculum
          </button>
          <button class="btn btn-sm btn-danger"
            onclick="deleteCourse('${c.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

/* ==========================================
   LOAD DEPARTMENTS
========================================== */
async function loadDepartments() {
  const data = await apiRequest('/api/departments');
  if (!data) return;

  const select = document.getElementById('courseDepartment');
  select.innerHTML = '';

  data.forEach((d) => {
    select.innerHTML += `
      <option value="${d.id}">${d.name}</option>
    `;
  });
}

/* ==========================================
   SAVE COURSE
========================================== */
async function saveCourse() {
  const name = document.getElementById('courseName').value;
  const department_id = document.getElementById('courseDepartment').value;

  if (!name) return alert('Course name required');

  await apiRequest('/api/courses', 'POST', {
    name,
    department_id,
  });

  bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();

  loadCourses();
}

/* ==========================================
   DELETE COURSE
========================================== */
async function deleteCourse(id) {
  if (!confirm('Delete this course?')) return;

  await apiRequest(`/api/courses/${id}`, 'DELETE');
  loadCourses();
}

/* ==========================================
   OPEN COURSE MODAL
========================================== */
function openCourseModal() {
  new bootstrap.Modal(document.getElementById('courseModal')).show();
}

/* ==========================================
   CURRICULUM MANAGEMENT
========================================== */

async function openCurriculumModal(courseId, courseName) {
  document.getElementById('curriculumCourseId').value = courseId;
  document.getElementById(
    'curriculumTitle'
  ).innerText = `Curriculum - ${courseName}`;

  loadSubjectsDropdown();
  loadCurriculum(courseId);

  new bootstrap.Modal(document.getElementById('curriculumModal')).show();
}

async function loadSubjectsDropdown() {
  const subjects = await apiRequest('/api/subjects');
  const select = document.getElementById('curriculumSubject');
  select.innerHTML = '<option value="">Select Subject</option>';

  subjects.forEach((s) => {
    select.innerHTML += `
      <option value="${s.id}">
        ${s.name}
      </option>
    `;
  });
}

async function loadCurriculum(courseId) {
  const data = await apiRequest(`/api/curriculum/${courseId}`);
  const container = document.getElementById('curriculumList');
  container.innerHTML = '';

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-muted">No subjects added yet.</p>';
    return;
  }

  data.forEach((item) => {
    container.innerHTML += `
      <div class="d-flex justify-content-between mb-1">
        <span>
          Year ${item.year_level} - Sem ${item.semester}
          : ${item.subjects.name}
        </span>
        <button class="btn btn-sm btn-danger"
          onclick="deleteCurriculum('${item.id}')">
          Remove
        </button>
      </div>
    `;
  });
}

async function addCurriculumSubject() {
  const course_id = document.getElementById('curriculumCourseId').value;
  const subject_id = document.getElementById('curriculumSubject').value;
  const year_level = document.getElementById('curriculumYearLevel').value;
  const semester = document.getElementById('curriculumSemester').value;

  if (!subject_id || !year_level || !semester) {
    alert('Complete all fields.');
    return;
  }

  const result = await apiRequest('/api/curriculum', 'POST', {
    course_id,
    subject_id,
    year_level,
    semester,
  });

  if (result) {
    loadCurriculum(course_id);
  }
}

async function deleteCurriculum(id) {
  await apiRequest(`/api/curriculum/${id}`, 'DELETE');
  const course_id = document.getElementById('curriculumCourseId').value;
  loadCurriculum(course_id);
}
