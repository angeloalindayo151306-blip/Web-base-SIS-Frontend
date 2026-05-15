let allTeachers = [];

document.addEventListener('DOMContentLoaded', () => {
  loadTeachers();
  initializeSearch();
});

async function loadTeachers() {
  const teachers = await apiRequest('/api/teachers');
  if (!teachers) return;

  allTeachers = teachers;
  renderTeachers(teachers);
}

function renderTeachers(teachers) {
  const table = document.getElementById('teacherTable');
  table.innerHTML = '';

  teachers.forEach((t) => {
    table.innerHTML += `
      <tr>
        <td>${t.full_name}</td>
        <td>${t.email}</td>
        <td>${t.department_name || '-'}</td>
      </tr>
    `;
  });
}

function initializeSearch() {
  const input = document.getElementById('teacherSearch');
  input.addEventListener('keyup', function () {
    const keyword = this.value.toLowerCase();
    const filtered = allTeachers.filter(
      (t) =>
        t.full_name.toLowerCase().includes(keyword) ||
        t.email.toLowerCase().includes(keyword)
    );
    renderTeachers(filtered);
  });
}

function logout() {
  localStorage.clear();
  window.location.replace('/index.html');
}
