// src/services/dashboardService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

export default {

fetchDashboardStats() {
    return axios.get(`${API_URL}/data`)
},

getStudentDashboardStats(studentId) {
    return axios.get(`${API_URL}/student-dashboard/${studentId}`)
},

getTeacherDashboardStats(teacherId) {
    return axios.get(`${API_URL}/teacher-dashboard/${teacherId}`)
},

getNonTeachingDashboardStats(roleId) {
    return axios.get(`${API_URL}/${roleId}/non-teaching-dashboard`)
}

}