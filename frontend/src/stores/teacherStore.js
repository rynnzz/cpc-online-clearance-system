import { defineStore } from 'pinia';
import teacherService from '@/services/teacherService';

export const useTeacherStore = defineStore('teacherStore', {
  state: () => ({
    teachers: [],
    isLoading: false,
  }),
  actions: {
    async fetchTeachers() {
      this.isLoading = true;
      try {
        const response = await teacherService.getAllTeachers(); // Ensure this method aligns with the backend service
        this.teachers = response.data;
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async addTeacher(teacher) {
      try {
        await teacherService.addTeacher(teacher);
        await this.fetchTeachers(); // Fetch the updated list of teachers
      } catch (error) {
        console.error("Failed to add teacher:", error);
      }
    },    

    async updateTeacher(teacher) {
      try {
        await teacherService.updateTeacher(teacher.id, teacher); // Update teacher information
        const index = this.teachers.findIndex(t => t.id === teacher.id);
        if (index !== -1) {
          this.teachers[index] = { ...teacher }; // Update the teacher in the list
        }
      } catch (error) {
        console.error("Failed to update teacher:", error);
      }
    },

    async deleteTeacher(id) {
      try {
        await teacherService.deleteTeacher(id); // Remove teacher from the backend
        this.teachers = this.teachers.filter(t => t.id !== id); // Remove teacher from the list
      } catch (error) {
        console.error("Failed to delete teacher:", error);
      }
    }
  }
});
