const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('crs_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.detail || data?.message || 'An unexpected error occurred';
    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export const api = {
  // Authentication
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (studentData) => request('/auth/register', { method: 'POST', body: studentData }),
  
  // Student
  getMyProfile: () => request('/students/me'),
  getMyRegistrations: () => request('/students/me/registrations'),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.has_seats !== undefined && params.has_seats !== null) query.append('has_seats', params.has_seats);
    const queryString = query.toString();
    return request(`/courses${queryString ? `?${queryString}` : ''}`);
  },
  getCourse: (courseId) => request(`/courses/${courseId}`),
  createCourse: (courseData) => request('/courses', { method: 'POST', body: courseData }),
  updateCourse: (courseId, courseData) => request(`/courses/${courseId}`, { method: 'PUT', body: courseData }),
  deleteCourse: (courseId) => request(`/courses/${courseId}`, { method: 'DELETE' }),

  // Registrations
  registerCourse: (courseId) => request('/registrations', { method: 'POST', body: { course_id: courseId } }),
  getRegistration: (id) => request(`/registrations/${id}`),
  updateRegistrationStatus: (id, status) => request(`/registrations/${id}/status`, { method: 'PATCH', body: { status } }),
  cancelRegistration: (id) => request(`/registrations/${id}`, { method: 'DELETE' }),

  // Administration
  getAdminStudents: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/admin/students${query}`);
  },
  getAdminRegistrations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.course_id) query.append('course_id', params.course_id);
    if (params.student_id) query.append('student_id', params.student_id);
    const queryString = query.toString();
    return request(`/admin/registrations${queryString ? `?${queryString}` : ''}`);
  },
  getAdminStatistics: () => request('/admin/statistics'),
};
