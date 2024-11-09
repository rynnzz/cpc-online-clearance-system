import { defineStore } from 'pinia';
import studentService from '@/services/studentService';
import { useAuthStore } from '@/stores/authStore';

export const useStudentStore = defineStore('studentStore', {
  state: () => ({
    students: [],
    isLoading: false,
    currentTeacher: {}, 
  }),
  actions: {
    async fetchStudents() {
      this.isLoading = true;
      try {
        const response = await studentService.getAllStudents(); // Ensure this method aligns with the backend service
        this.students = response.data;
      } catch (error) {
        console.error("Failed to fetch Students:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async getStudentInfo() {
      try {
        const authStore = useAuthStore();
        const studentId = authStore.userId;
        const response = await studentService.getStudentInfo(studentId); // Pass the extracted userId to the service

        this.currentStudent = response.data; // Store the teacher info in the currentTeacher state
      } catch (error) {
        console.error("Failed to get Teacher Info", error);
      }
    },

    async addSubject(payload) {
      try {
        const authStore = useAuthStore();
        const id = authStore.userId; 
        await studentService.addSubject(id, payload)
      } catch (error) {
        console.error("Failed to add Subjects", error)
      }
    },

    async addStudent(student) {
      try {
        await studentService.addStudent(student);
        await this.fetchStudents(); // Fetch the updated list of Students
      } catch (error) {
        console.error("Failed to add Student:", error);
      }
    }, 
    
    async bulkAddStudents(formData) {
      try {
        await studentService.bulkAddStudents(formData); // Call service to upload and process file
        await this.fetchStudents(); // Refresh the students list after successful bulk add
        console.log("Students added successfully through bulk add.");
      } catch (error) {
        console.error("Failed to bulk add Students:", error);
      }
    },

    async updateStudent(student) {
      try {
        await studentService.updateStudent(student.id, student); // Update Student information
        const index = this.students.findIndex(t => t.id === student.id);
        if (index !== -1) {
          this.students[index] = { ...student }; // Update the Student in the list
        }
      } catch (error) {
        console.error("Failed to update Student:", error);
      }
    },

    async deleteStudent(id) {
      try {
        await studentService.deleteStudent(id); // Remove Student from the backend
        this.students = this.students.filter(t => t.id !== id); // Remove Student from the list
      } catch (error) {
        console.error("Failed to delete Student:", error);
      }
    }
  }
});
