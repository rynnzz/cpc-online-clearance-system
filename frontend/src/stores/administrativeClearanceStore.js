import { defineStore } from 'pinia';
import administrativeClearanceServices from '@/services/administrativeClearanceServices';

export const useAdministrativeClearanceStore = defineStore('administrativeClearanceStore', {
  state: () => ({
    isLoading: false,
    successMessage: null,
    errorMessage: null,
  }),

  actions: {
    // Update the clearance status of a student
    async updateClearanceStatus(studentId, departmentId, sectionId, status) {
      this.isLoading = true;
      this.successMessage = null;
      this.errorMessage = null;

      try {
        await administrativeClearanceServices.updateClearanceStatus(studentId, departmentId, sectionId, status);
        this.successMessage = `Student clearance status updated to ${status}`;
      } catch (error) {
        console.error('Error updating administrative clearance status:', error);
        this.errorMessage = 'Failed to update student clearance status.';
      } finally {
        this.isLoading = false;
      }
    },

    // Bulk update clearance statuses for a list of students
    async bulkUpdateStatus(studentIds, departmentId, sectionId, status) {
      this.isLoading = true;
      this.successMessage = null;
      this.errorMessage = null;

      try {
        await Promise.all(
          studentIds.map((studentId) =>
            administrativeClearanceServices.updateClearanceStatus(studentId, departmentId, sectionId, status)
          )
        );
        this.successMessage = `Bulk update: All selected students have been updated to ${status}.`;
      } catch (error) {
        console.error('Error during bulk update of administrative clearance:', error);
        this.errorMessage = 'Failed to update some or all students.';
      } finally {
        this.isLoading = false;
      }
    },
  },
});
