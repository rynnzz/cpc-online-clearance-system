import { defineStore } from 'pinia';
import clearanceService from '@/services/clearanceServices';

export const useClearanceStore = defineStore('clearance', {
  state: () => ({
    clearanceData: {},
    studentId: null,
    subjectId: null,
    sectionId: null,
  }),
  actions: {

    async getClearanceStatus(studentId) {
        try {
          const data = await clearanceService.getClearanceStatus(studentId);
          this.clearanceData[studentId] = data;
        } catch (error) {
          console.error('Error getting clearance status:', error);
        }
      },

    async updateClearanceStatus(studentId, subjectId, sectionId, status) {
      this.studentId = studentId;
      this.subjectId = subjectId;
      this.sectionId = sectionId;

      try {
        await clearanceService.updateClearanceStatus(studentId, subjectId, sectionId, status);

        // Optional: Update local clearance data in the state if needed
        if (this.clearanceData[studentId]) {
          const section = this.clearanceData[studentId].find(sec => sec.sectionId === sectionId);
          const subject = section?.subjects?.find(sub => sub.subjectId === subjectId);
          if (subject) subject.status = status;
        }
      } catch (error) {
        console.error('Error updating clearance status:', error);
      }
    },
    
  },
});
