import axios from 'axios';

const API_URL = 'http://localhost:5000/api/teachers'; // Update based on your backend route

export default {
  getAllTeachers() {
    return axios.get(API_URL);
  },

  addTeacher(teacher) {
    return axios.post(API_URL, teacher);
  },

  updateTeacher(id, teacher) {
    return axios.put(`${API_URL}/${id}`, teacher);
  },

  deleteTeacher(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
};
