import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students'; // Update based on your backend route

export default {
  getAllStudents() {
    return axios.get(API_URL);
  },

  addStudent(student) {
    return axios.post(API_URL, student);
  },

  updateStudent(id, student) {
    return axios.put(`${API_URL}/${id}`, student);
  },

  deleteStudent(id) {
    return axios.delete(`${API_URL}/${id}`);
  },

};
