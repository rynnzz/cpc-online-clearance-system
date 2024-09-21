import axios from 'axios';

const API_URL = 'http://localhost:5000/api/subjects'; // Replace with your actual API URL

export default {
  getAllSubjects() {
    return axios.get(API_URL);
  },
}