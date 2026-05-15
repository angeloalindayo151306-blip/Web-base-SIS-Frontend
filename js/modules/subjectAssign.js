document.addEventListener('DOMContentLoaded', () => {
  loadSubjects();
  loadStudents();
});

async function loadSubjects() {
  const subjects = await apiRequest('/api/subjects');
  const select = document.getElementById('assignSubjectSelect');
  select.innerHTML = '';

  subjects.forEach((s) => {
    select.innerHTML += `
      <option value="${s.id}">
        ${s.name}
      </option>
    `;
  });
}

async function loadStudents() {
  const students = await apiRequest('/api/students');
  const select = document.getElementById('assignStudentSelect');
  select.innerHTML = '';

  students.forEach((s) => {
    select.innerHTML += `
      <option value="${s.id}">
        ${s.full_name || s.first_name + ' ' + s.last_name}
      </option>
    `;
  });
}

async function assignStudents() {
  const subject_id = document.getElementById('assignSubjectSelect').value;
  const selected = Array.from(
    document.getElementById('assignStudentSelect').selectedOptions
  );

  const student_ids = selected.map((o) => o.value);

  await apiRequest('/api/enrollments', 'POST', {
    subject_id,
    student_ids,
  });

  alert('Students assigned ✅');
}
