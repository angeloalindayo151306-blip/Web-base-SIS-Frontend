let subjectModal;
let allSubjects = [];

document.addEventListener('DOMContentLoaded', () => {
  subjectModal = new bootstrap.Modal(document.getElementById('subjectModal'));

  loadSubjects();
  loadCourses(); // ✅ THIS WAS MISSING
});

/* ===============================
   LOAD SUBJECTS
================================ */
async function loadSubjects() {
  const subjects = await apiRequest('/api/subjects');
  if (!subjects) return;

  allSubjects = subjects;
  renderSubjects(subjects);
}

/* ===============================
   LOAD COURSES (FIXED)
================================ */
async function loadCourses() {
  const courses = await apiRequest('/api/courses');
  if (!courses) return;

  const select = document.getElementById('subjectCourse');
  if (!select) return;

  select.innerHTML = '<option value="">Select Course</option>';

  courses.forEach((c) => {
    select.innerHTML += `
      <option value="${c.id}">
        ${c.name} (${c.department_name})
      </option>
    `;
  });
}

/* ===============================
   RENDER TABLE
================================ */
function renderSubjects(subjects) {
  const table = document.getElementById('subjectTable');
  table.innerHTML = '';

  subjects.forEach((s) => {
    table.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.course_name || '-'}</td>
        <td>${s.department_name || '-'}</td>
        <td>
          <button class="btn btn-sm btn-danger"
            onclick="deleteSubject('${s.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

/* ===============================
   OPEN MODAL
================================ */
function openAddModal() {
  subjectModal.show();
}

/* ===============================
   SAVE SUBJECT
================================ */
async function saveSubject() {
  const name = document.getElementById('subjectName').value.trim();
  const course_id = document.getElementById('subjectCourse').value;

  if (!name || !course_id) {
    alert('Subject name and course required.');
    return;
  }

  await apiRequest('/api/subjects', 'POST', { name, course_id });

  subjectModal.hide();
  loadSubjects();
}

/* ===============================
   DELETE SUBJECT
================================ */
async function deleteSubject(id) {
  if (!confirm('Delete this subject?')) return;

  await apiRequest(`/api/subjects/${id}`, 'DELETE');
  loadSubjects();
}
