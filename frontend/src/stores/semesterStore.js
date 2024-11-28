import { defineStore } from 'pinia';
import semesterService from '@/services/semesterService';

export const useSemesterStore = defineStore('semesterStore', {
    state: () => ({
      error: null,
      currentSemester: ''
    }),
  
    actions: {
        async updateSemester(selectedSemester) {
            try {
              await semesterService.updateSemester(selectedSemester);
              console.log("Subject semester updated successfully.");
            } catch (error) {
              console.error("Failed to update subject semester:", error);
              this.error = error;
            }
          },
      
          async getSemester() {
            try {
              const semester = await semesterService.getSemester();
              return semester.data[0]?.semester; 
            } catch (error) {
              console.error("Failed to fetch subject semester:", error);
              this.error = error;
              return null;
            }
          },
        }
    });
