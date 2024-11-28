import axios from 'axios';

const API_URL = 'http://localhost:5000/api/administrative';

export default {
  // Update clearance status for a student
  async updateClearanceStatus(studentId, departmentId, sectionId, status) {
    const payload = { studentId, departmentId, sectionId, status };
    return axios.post(`${API_URL}/update`, payload);
  },
  
  getClearanceStatus(studentId, departmentId, sectionId) {
    return axios.get(`${API_URL}/status/${studentId}/${departmentId}/${sectionId}`);
  },
};
