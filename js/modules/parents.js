let allParents = [];

document.addEventListener('DOMContentLoaded', () => {
  loadParents();
  initializeSearch();
});

async function loadParents() {
  const parents = await apiRequest('/api/parents');
  if (!parents) return;

  allParents = parents;
  renderParents(parents);
}

function renderParents(parents) {
  const table = document.getElementById('parentTable');
  table.innerHTML = '';

  parents.forEach((p) => {
    const students = p.students.length
      ? p.students
          .map((s) => `<span class="badge bg-info me-1">${s.name}</span>`)
          .join('')
      : '-';

    table.innerHTML += `
      <tr>
        <td>${p.full_name}</td>
        <td>${p.email}</td>
        <td>${students}</td>
      </tr>
    `;
  });
}

function initializeSearch() {
  const input = document.getElementById('parentSearch');
  input.addEventListener('keyup', function () {
    const keyword = this.value.toLowerCase();
    const filtered = allParents.filter(
      (p) =>
        p.full_name.toLowerCase().includes(keyword) ||
        p.email.toLowerCase().includes(keyword)
    );
    renderParents(filtered);
  });
}

function logout() {
  localStorage.clear();
  window.location.replace('/index.html');
}
