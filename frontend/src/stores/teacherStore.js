import { defineStore } from 'pinia';
import teacherService from '@/services/teacherService';
import { useAuthStore } from '@/stores/authStore';


export const useTeacherStore = defineStore('teacherStore', {
  state: () => ({
    teachers: [],
    isLoading: false,
    currentPage: 1,
    pageSize: 10, // Set your desired page size
  }),

  getters: {
    totalPages(state) {
      return Math.ceil(state.teachers.length / state.pageSize);
    },
    paginatedTeachers(state) {
      const start = (state.currentPage - 1) * state.pageSize;
      return state.teachers.slice(start, start + state.pageSize);
    }
  },

  actions: {
    async fetchTeachers() {
      this.isLoading = true;
      try {
        const response = await teacherService.getAllTeachers();
        const { teachers } = response.data;
    
        if (Array.isArray(teachers)) {
          this.teachers = teachers.map(teacher => {
            const yearSectionSubjects = teacher.yearSectionSubjects || [];
            return {
              ...teacher,
              yearSectionSubjects: yearSectionSubjects.map(section => ({
                course: section.course,
                year_and_section: section.year_and_section,
                subjects: section.subjects || []
              })),
            };
          });
        } else {
          console.error("Unexpected response format:", teachers);
          this.teachers = [];
        }
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
        await teacherService.updateTeacher(teacher.id, teacher);
        const index = this.teachers.findIndex(t => t.id === teacher.id);
        if (index !== -1) {
          this.teachers[index] = { ...teacher };
        }
      } catch (error) {
        console.error("Failed to update teacher:", error);
      }
    },

    async deleteTeacher(id) {
      try {
        await teacherService.deleteTeacher(id);
        this.teachers = this.teachers.filter(t => t.id !== id);
      } catch (error) {
        console.error("Failed to delete teacher:", error);
      }
    },


    async addYearSection(sections) {
      try {
        const authStore = useAuthStore();
        const teacherId = authStore.userId; 

        await teacherService.addYearSection(teacherId, sections);
      } catch (error) {
        console.error("Failed to add Year and Section:", error);
      }
    },

    async deleteTeacherSection(sectionId) {
      this.loading = true;
      try {
        await teacherService.deleteTeacherSection(sectionId)
        this.message = 'Year Section removed successfully';
      } catch (error) {
        this.error = 'Failed to remove Year Section';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    setPage(page) {
      this.currentPage = page;
    },
  }
});
