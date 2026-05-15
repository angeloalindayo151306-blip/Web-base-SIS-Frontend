function getToken() {
  return localStorage.getItem('token');
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const token = getToken();

    if (!token) {
      alert('You are not logged in.');
      window.location.href = '../index.html';
      return null;
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(API_URL + endpoint, options);

    // ✅ Handle expired token
    if (response.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.clear();
      window.location.href = '../index.html';
      return null;
    }

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data?.error || 'Request failed');
    }

    return data;
  } catch (err) {
    console.error('API Error:', err.message);
    alert(err.message || 'Server error');
    return null;
  }
}
