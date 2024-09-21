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
        const response = await teacherService.getAllTeachers();
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
      const originalTeacher = { ...teacher }; // Make a copy of the original teacher for rollback if needed
    
      try {
        // Attempt to update the teacher information in the backend
        await teacherService.updateTeacher(teacher.id, teacher);
    
        // Find the index of the teacher in the local list
        const index = this.teachers.findIndex(t => t.id === teacher.id);
        
        // If the teacher exists in the local list, update their information
        if (index !== -1) {
          this.teachers[index] = { ...teacher }; // Update the teacher in the list
        }
      } catch (error) {
        console.error("Failed to update teacher:", error);
    
        // Optionally, revert to the original data if needed
        const index = this.teachers.findIndex(t => t.id === originalTeacher.id);
        if (index !== -1) {
          this.teachers[index] = originalTeacher; // Revert back to original data
        }
      }
    },
    
    

    async deleteTeacher(id) {
      try {
        await teacherService.deleteTeacher(id); // Remove teacher from the backend
        this.teachers = this.teachers.filter(t => t.id !== id); // Remove teacher from the list
      } catch (error) {
        console.error("Failed to delete teacher:", error);
      }
    },
  }
});
