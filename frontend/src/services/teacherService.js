import axios from 'axios';

const API_URL = 'http://localhost:5000/api/teachers'; // Base URL for teacher-related routes

export default {
  // Get all teachers
  getAllTeachers() {
    return axios.get(API_URL);
  },

  getTeacherInfo(id) {
    return axios.get(`${API_URL}/${id}/get-teacher-info`)
  },

  // Add a new teacher
  addTeacher(teacher) {
    return axios.post(API_URL, teacher);
  },

  bulkAddTeachers(formData) {
    return axios.post(`${API_URL}/bulk-add`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update teacher details
  updateTeacher(id, teacher) {
    return axios.put(`${API_URL}/${id}`, teacher);
  },

  // Delete a teacher
  deleteTeacher(id) {
    return axios.delete(`${API_URL}/${id}`);
  },

  addYearSection(id, sections) {
    return axios.post(`${API_URL}/${id}/year-sections`, sections);
  },

  deleteYearSection(sectionId) {
  return axios.delete(`${API_URL}/${sectionId}`)
  }
  
}