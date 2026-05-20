let offeringModal;
let allOfferings = [];

document.addEventListener('DOMContentLoaded', () => {
  offeringModal = new bootstrap.Modal(document.getElementById('offeringModal'));
  loadOfferings();
  loadSubjects();
  loadTeachers();
  loadSchoolYears();
});

async function loadOfferings() {
  const data = await apiRequest('/api/subject-offerings');
  if (!data) return;
  allOfferings = data;
  renderOfferings(data);
}

function renderOfferings(offerings) {
  const table = document.getElementById('offeringTable');
  table.innerHTML = '';

  offerings.forEach((o) => {

    const daysDisplay = o.days?.join(', ') || '-';

    table.innerHTML += `
      <tr>
        <td>${o.subject_name}</td>
        <td>${o.teacher_name}</td>
        <td>${o.school_year}</td>
        <td>${o.semester}</td>
        <td>${daysDisplay}</td>
        <td>${o.start_time || '-'}</td>
        <td>${o.end_time || '-'}</td>
        <td>
          <button class="btn btn-sm btn-warning"
            onclick="editOffering('${o.id}')">
            Edit
          </button>

          <button class="btn btn-sm btn-danger"
            onclick="deleteOffering('${o.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

function editOffering(id) {

  const offering = allOfferings.find(o => o.id === id);
  if (!offering) return;

  document.getElementById('subjectSelect').value = offering.subject_id;
  document.getElementById('teacherSelect').value = offering.teacher_id;
  document.getElementById('schoolYearSelect').value = offering.school_year_id;
  document.getElementById('semesterSelect').value = offering.semester;
  document.getElementById('startTime').value = offering.start_time;
  document.getElementById('endTime').value = offering.end_time;

  const daySelect = document.getElementById('offeringDays');
  if (daySelect) {
    Array.from(daySelect.options).forEach(option => {
      option.selected = offering.days.includes(option.value);
    });
  }

  document.getElementById('offeringModal').setAttribute('data-edit-id', id);

  offeringModal.show();
}

async function saveSubjectOffering() {

const subject_id = document.getElementById('subjectSelect').value;
const teacher_id = document.getElementById('teacherSelect').value;
const school_year_id = document.getElementById('schoolYearSelect').value;
const semester = document.getElementById('semesterSelect').value;

  const selectedDays = Array.from(
    document.getElementById('offeringDays').selectedOptions
  ).map(o => o.value);

  const start_time = document.getElementById('startTime').value;
  const end_time = document.getElementById('endTime').value;

  if (!subject_id || !teacher_id || !school_year_id || !semester || selectedDays.length === 0) {
    alert('All fields are required.');
    return;
  }

  if (start_time >= end_time) {
    alert('Start time must be earlier than end time.');
    return;
  }

  const editId = document.getElementById('offeringModal').getAttribute('data-edit-id');

  if (editId) {
    await apiRequest(`/api/subject-offerings/${editId}`, 'PUT', {
      subject_id,
      teacher_id,
      school_year_id,
      semester,
      days: selectedDays,
      start_time,
      end_time
    });
  } else {
    await apiRequest('/api/subject-offerings', 'POST', {
      subject_id,
      teacher_id,
      school_year_id,
      semester,
      days: selectedDays,
      start_time,
      end_time
    });
  }

  document.getElementById('offeringModal').removeAttribute('data-edit-id');
  location.reload();
}

async function deleteOffering(id) {
  if (!confirm('Delete this offering?')) return;
  await apiRequest(`/api/subject-offerings/${id}`, 'DELETE');
  loadOfferings();
}