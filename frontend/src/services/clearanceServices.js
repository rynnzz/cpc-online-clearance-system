import axios from 'axios';

const API_URL = 'http://localhost:5000/api/clearance'; // Update based on your backend route

export default {

  getClearanceStatus(studentId) {
    return axios.get(`${API_URL}/${studentId}/get-clearance-status`);
  },

  // Update clearance status for a specific student, subject, and section
  updateClearanceStatus(studentId, subjectId, sectionId, status) {
    return axios.post(`${API_URL}/update`, {
      studentId,
      subjectId,
      sectionId,
      status,
    });
  },
};
