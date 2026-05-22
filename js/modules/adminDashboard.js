document.addEventListener('DOMContentLoaded', initDashboard);

let userChartInstance = null;
let attendanceChartInstance = null;

async function initDashboard() {
  loadWelcome();
  await loadDashboardCards();
}

/* ==========================================
LOAD WELCOME MESSAGE (SAFE VERSION)
========================================== */
function loadWelcome() {
  const welcomeEl = document.getElementById('welcome');
  if (!welcomeEl) return;

  try {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.first_name) {
      welcomeEl.innerText = `Welcome, ${userData.first_name}`;
    } else {
      welcomeEl.innerText = 'Welcome, Admin';
    }
  } catch (err) {
    welcomeEl.innerText = 'Welcome';
  }
}

/* ==========================================
LOAD DASHBOARD CARDS
========================================== */
async function loadDashboardCards() {
  const data = await apiRequest('/api/dashboard');
  if (!data) return;

  const container = document.getElementById('dashboardCards');
  if (!container) return;

  const totalStudents = data.totalStudents || 0;
  const totalTeachers = data.totalTeachers || 0;
  const totalClasses = data.totalClasses || 0;
  const presentToday = data.presentToday || 0;
  const lateToday = data.lateToday || 0;

  container.innerHTML = `
    <div class="col-lg-3 col-md-6 mb-4">
      <div class="card shadow-sm h-100 text-center p-3">
        <h6 class="text-muted">Total Students</h6>
        <h2 class="fw-bold">${totalStudents}</h2>
      </div>
    </div>

    <div class="col-lg-3 col-md-6 mb-4">
      <div class="card shadow-sm h-100 text-center p-3">
        <h6 class="text-muted">Total Teachers</h6>
        <h2 class="fw-bold">${totalTeachers}</h2>
      </div>
    </div>

    <div class="col-lg-3 col-md-6 mb-4">
      <div class="card shadow-sm h-100 text-center p-3">
        <h6 class="text-muted">Total Classes</h6>
        <h2 class="fw-bold">${totalClasses}</h2>
      </div>
    </div>

    <div class="col-lg-3 col-md-6 mb-4">
      <div class="card shadow-sm h-100 text-center p-3">
        <h6 class="text-muted">Present Today</h6>
        <h2 class="fw-bold text-success">${presentToday}</h2>
      </div>
    </div>

    <div class="col-lg-3 col-md-6 mb-4">
      <div class="card shadow-sm h-100 text-center p-3">
        <h6 class="text-muted">Late Today</h6>
        <h2 class="fw-bold text-warning">${lateToday}</h2>
      </div>
    </div>
  `;

  renderCharts({
    totalStudents,
    totalTeachers,
    presentToday,
    lateToday
  });
}

/* ==========================================
RENDER CHARTS (SAFE + DESTROY OLD)
========================================== */
function renderCharts(data) {

  /* ---------- USER DISTRIBUTION CHART ---------- */
  const userCtx = document.getElementById('userChart');

  if (userCtx) {

    if (userChartInstance) {
      userChartInstance.destroy();
    }

    userChartInstance = new Chart(userCtx, {
      type: 'doughnut',
      data: {
        labels: ['Students', 'Teachers'],
        datasets: [{
          data: [data.totalStudents, data.totalTeachers],
          backgroundColor: ['#0d6efd', '#198754']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  /* ---------- ATTENDANCE CHART ---------- */
  const attendanceCtx = document.getElementById('attendanceChart');

  if (attendanceCtx) {

    if (attendanceChartInstance) {
      attendanceChartInstance.destroy();
    }

    attendanceChartInstance = new Chart(attendanceCtx, {
      type: 'bar',
      data: {
        labels: ['Present', 'Late'],
        datasets: [{
          label: 'Today',
          data: [data.presentToday, data.lateToday],
          backgroundColor: ['#198754', '#ffc107']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}