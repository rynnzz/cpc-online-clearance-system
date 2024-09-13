import { defineStore } from 'pinia';
import studentService from '@/services/studentService';

export const useStudentStore = defineStore('studentStore', {
  state: () => ({
    students: [],
    isLoading: false,
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

    async addStudent(student) {
      try {
        await studentService.addStudent(student);
        await this.fetchStudents(); // Fetch the updated list of Students
      } catch (error) {
        console.error("Failed to add Student:", error);
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
