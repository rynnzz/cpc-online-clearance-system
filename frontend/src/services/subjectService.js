// src/services/subjectService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/subjects';

export default {
  getAllSubjects() {
    return axios.get(API_URL);
  },

  addSubject(subject) {
    return axios.post(API_URL, subject);
  },

  bulkAddSubjects(formData) {
    return axios.post(`${API_URL}/bulk-add`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateSubject(subjectId, updatedData) {
    return axios.put(`${API_URL}/${subjectId}`, updatedData);
  },
  

  deleteSubject(subjectId) {
    return axios.delete(`${API_URL}/${subjectId}`);
  },
};
