// ✅ Require authentication
requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  loadDepartments();
});

/* ==========================================
   LOAD DEPARTMENTS
========================================== */
async function loadDepartments() {
  try {
    const data = await apiRequest('/api/departments');

    if (!data) {
      console.error('Departments API returned null.');
      return;
    }

    const tbody = document.getElementById('departmentTableBody');

    if (!tbody) {
      console.error('departmentTableBody not found in HTML.');
      return;
    }

    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="2" class="text-center text-muted">
            No departments found.
          </td>
        </tr>
      `;
      return;
    }

    data.forEach((d) => {
      tbody.innerHTML += `
        <tr>
          <td>${d.name}</td>
          <td>
            <button class="btn btn-sm btn-danger"
              onclick="deleteDepartment('${d.id}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error loading departments:', err);
  }
}

/* ==========================================
   SAVE DEPARTMENT
========================================== */
async function saveDepartment() {
  const nameInput = document.getElementById('departmentName');

  if (!nameInput) {
    console.error('departmentName input not found.');
    return;
  }

  const name = nameInput.value.trim();

  if (!name) {
    alert('Department name required');
    return;
  }

  const response = await apiRequest('/api/departments', 'POST', { name });

  if (!response) return;

  const modalElement = document.getElementById('departmentModal');
  if (modalElement) {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
  }

  nameInput.value = '';
  loadDepartments();
}

/* ==========================================
   DELETE DEPARTMENT
========================================== */
async function deleteDepartment(id) {
  if (!confirm('Delete this department?')) return;

  const response = await apiRequest(`/api/departments/${id}`, 'DELETE');

  if (!response) return;

  loadDepartments();
}

/* ==========================================
   OPEN MODAL
========================================== */
function openDepartmentModal() {
  const modalElement = document.getElementById('departmentModal');

  if (!modalElement) {
    console.error('departmentModal not found.');
    return;
  }

  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}
