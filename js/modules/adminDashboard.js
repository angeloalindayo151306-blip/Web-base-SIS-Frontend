document.addEventListener('DOMContentLoaded', initDashboard);

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

  container.innerHTML = `
    <div class="col-md-3">
      <div class="card shadow-sm p-3 text-center">
        <h6>Total Students</h6>
        <h3>${data.totalStudents}</h3>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm p-3 text-center">
        <h6>Total Teachers</h6>
        <h3>${data.totalTeachers}</h3>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm p-3 text-center">
        <h6>Total Classes</h6>
        <h3>${data.totalClasses}</h3>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm p-3 text-center">
        <h6>Present Today</h6>
        <h3>${data.presentToday}</h3>
      </div>
    </div>

    <div class="col-md-3 mt-4">
      <div class="card shadow-sm p-3 text-center">
        <h6>Late Today</h6>
        <h3>${data.lateToday}</h3>
      </div>
    </div>
  `;

  renderCharts(data);
}

/* ==========================================
   RENDER CHARTS (SAFE)
========================================== */
function renderCharts(data) {
  const userCtx = document.getElementById('userChart');
  if (userCtx) {
    new Chart(userCtx, {
      type: 'doughnut',
      data: {
        labels: ['Students', 'Teachers'],
        datasets: [
          {
            data: [data.totalStudents, data.totalTeachers],
            backgroundColor: ['#0d6efd', '#198754'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  const attendanceCtx = document.getElementById('attendanceChart');
  if (attendanceCtx) {
    new Chart(attendanceCtx, {
      type: 'bar',
      data: {
        labels: ['Present', 'Late'],
        datasets: [
          {
            label: 'Today',
            data: [data.presentToday, data.lateToday],
            backgroundColor: ['#198754', '#ffc107'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });
  }
}
