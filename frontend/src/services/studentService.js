import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students'; // Update based on your backend route

export default {
  getAllStudents() {
    return axios.get(API_URL);
  },

  getStudentInfo(id) {
    return axios.get(`${API_URL}/${id}/get-student-info`)
  },

  addStudent(student) {
    return axios.post(API_URL, student);
  },

  bulkAddStudents(formData) {
    return axios.post(`${API_URL}/bulk-add`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addSubject(id, payload) {
    return axios.post(`${API_URL}/${id}/add-subject`, payload)
  },

  updateStudent(id, student) {
    return axios.put(`${API_URL}/${id}`, student);
  },

  deleteStudent(id) {
    return axios.delete(`${API_URL}/${id}`);
  },

};
