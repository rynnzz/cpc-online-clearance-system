import axios from 'axios';

const API_URL = 'http://localhost:5000/api/semester';

export default {

  getSemester() {
    return axios.get(`${API_URL}/get-semester`);
  },

  updateSemester(semester) {
    return axios.put(`${API_URL}/update-semester`, semester ); // Send as an object with `semester` key
  },

}