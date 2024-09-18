import axios from 'axios';

const API_URL = 'http://localhost:5000/api/teachers'; // Base URL for teacher-related routes

export default {
  // Get all teachers
  getAllTeachers() {
    return axios.get(API_URL);
  },

  // Add a new teacher
  addTeacher(teacher) {
    return axios.post(API_URL, teacher);
  },

  // Update teacher details
  updateTeacher(id, teacher) {
    return axios.put(`${API_URL}/${id}`, teacher);
  },

  // Delete a teacher
  deleteTeacher(id) {
    return axios.delete(`${API_URL}/${id}`);
  },

  // Get subjects handled by a specific teacher
  getTeacherSubjects(teacherId) {
    return axios.get(`${API_URL}/${teacherId}/subjects`);
  }
};
