/* ==========================================
   LOGIN FUNCTION
========================================== */
async function login(email, password) {
  try {
    const response = await fetch(API_URL + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Login failed');
      return;
    }

    if (!data.token || !data.user) {
      alert('Invalid login response');
      return;
    }

    const user = data.user;

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));

    // ✅ Role-based redirect (absolute paths)
    if (user.role === 'admin') {
      window.location.href = '/dashboard.html';
    } else if (user.role === 'teacher') {
      window.location.href = '/pages/teacher-dashboard.html';
    } else if (user.role === 'student') {
      window.location.href = '/pages/student-dashboard.html';
    } else if (user.role === 'parent') {
      window.location.href = '/pages/parent-dashboard.html';
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Something went wrong. Please try again.');
  }
}

/* ==========================================
   LOGOUT FUNCTION
========================================== */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    sessionStorage.clear();

    // ✅ Always go to root login page
    window.location.href = '/index.html';
  }
}

window.logout = logout;
