requireAuth();

const user = JSON.parse(localStorage.getItem('user'));

if (!user) {
  window.location.href = 'index.html';
}

document.getElementById(
  'welcome'
).innerText = `Welcome, ${user.full_name} (${user.role})`;

const menu = document.getElementById('menu');

function card(title, link, color) {
  return `
    <div class="col-md-4">
      <div class="card text-bg-${color} shadow">
        <div class="card-body">
          <h5>${title}</h5>
          <a href="${link}" class="btn btn-light btn-sm mt-2">Open</a>
        </div>
      </div>
    </div>`;
}

if (user.role === 'admin') {
  menu.innerHTML += card('Students', 'pages/students.html', 'primary');
  menu.innerHTML += card('Teachers', 'pages/teachers.html', 'success');
  menu.innerHTML += card('Parents', 'pages/parents.html', 'dark');
  menu.innerHTML += card('Grades', 'pages/grades.html', 'info');
  menu.innerHTML += card('Attendance', 'pages/attendance.html', 'danger');
}

if (user.role === 'teacher') {
  menu.innerHTML += card('Grades', 'pages/grades.html', 'info');
  menu.innerHTML += card('Attendance', 'pages/attendance.html', 'danger');
}

if (user.role === 'student') {
  menu.innerHTML += card('My Grades', 'pages/grades.html', 'success');
}

if (user.role === 'parent') {
  menu.innerHTML += card('Child Grades', 'pages/grades.html', 'warning');
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/index.html');
  }
}
