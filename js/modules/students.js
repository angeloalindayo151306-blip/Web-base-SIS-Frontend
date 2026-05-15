let allStudents = [];

document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  initializeSearch();
});

async function loadStudents() {
  const students = await apiRequest('/api/students');
  if (!students) return;

  allStudents = students;
  renderStudents(students);
}

function renderStudents(students) {
  const table = document.getElementById('studentTable');
  table.innerHTML = '';

  students.forEach((s) => {
    table.innerHTML += `
      <tr>
        <td>${s.student_number || '-'}</td>
        <td>${s.full_name}</td>
        <td>${s.course_name || '-'}</td>
        <td>${s.department_name || '-'}</td>
        <td>${s.year_level || '-'}</td>
        <td>${s.section || '-'}</td>
      </tr>
    `;
  });
}

function initializeSearch() {
  const input = document.getElementById('studentSearch');
  if (!input) return;

  input.addEventListener('keyup', function () {
    const keyword = this.value.toLowerCase();

    const filtered = allStudents.filter(
      (s) =>
        s.full_name.toLowerCase().includes(keyword) ||
        s.course_name.toLowerCase().includes(keyword)
    );

    renderStudents(filtered);
  });
}

function logout() {
  localStorage.clear();
  window.location.replace('/index.html');
}
