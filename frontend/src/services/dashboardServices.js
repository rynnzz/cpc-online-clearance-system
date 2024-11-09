// src/services/dashboardService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

export default {

fetchDashboardStats() {
    return axios.get(`${API_URL}/data`)
}

}