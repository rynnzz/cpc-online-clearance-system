// src/stores/dashboardStore.js
import { defineStore } from 'pinia';
import dashboardService from '@/services/dashboardServices';

export const useDashboardStore = defineStore('dashboardStore', {
  state: () => ({
    userCounts: { admin: 0, teacher: 0, student: 0, subjects: 0 },
    recentRegistrations: [],
    topPendingSections: [],
    isLoading: false,
    error: null,
    totalClearances: 0,
    totalSubjects: 0,
    totalUnits: 0,
    approvedClearances: 0,
    rejectedClearances: 0,
    teacherDashboard: {},
    pendingClearances: 0,
    totalStudents: 0,
    totalDepartments: 0,
  }),
  actions: {
    async fetchDashboardStats() {
      this.isLoading = true;
      this.error = null;
      try {
        // Fetch all stats in a single request
        const response = await dashboardService.fetchDashboardStats();

        // Destructure and assign data to relevant state properties
        const { 
          userCounts, 
          recentRegistrations,  
        } = response.data;

        // Assign data to the store's state
        this.userCounts = userCounts;
        this.recentRegistrations = recentRegistrations;
      } catch (error) {
        this.error = 'Failed to load dashboard stats';
        console.error("Error fetching dashboard stats:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async initializeDashboard() {
      await this.fetchDashboardStats();
    },

    async fetchStudentDashboardData(studentId) {
      this.isLoading = true;
      this.error = null;
      try {
        // Fetch dashboard stats for the student
        const response = await dashboardService.getStudentDashboardStats(studentId);

        // Destructure and assign response data to state properties
        const {
          total_clearances,
          total_subjects,
          total_units,
          approved_clearances,
          rejected_clearances,
        } = response.data;

        // Assign data to store's state
        this.totalClearances = total_clearances || 0;
        this.totalSubjects = total_subjects || 0;
        this.totalUnits = total_units || 0;
        this.approvedClearances = approved_clearances || 0;
        this.rejectedClearances = rejected_clearances || 0;
      } catch (error) {
        this.error = 'Failed to load student dashboard data';
        console.error("Error fetching student dashboard data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async initializeStudentDashboard(studentId) {
      await this.fetchStudentDashboardData(studentId);
    },
    async fetchTeacherDashboardData(teacherId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await dashboardService.getTeacherDashboardStats(teacherId);
        this.teacherDashboard = {
          totalSubjects: response.data.totalSubjects || 0,
          totalSections: response.data.totalSections || 0,
          totalStudents: response.data.totalStudents || 0,
        };
      } catch (error) {
        this.error = 'Failed to load teacher dashboard data';
        console.error("Error fetching teacher dashboard data:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async initializeTeacherDashboard(teacherId) {
      await this.fetchTeacherDashboardData(teacherId);
    },

    async fetchNonTeachingDashboardData(roleId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await dashboardService.getNonTeachingDashboardStats(roleId);
        this.pendingClearances = response.data.pendingClearances || 0;
        this.totalStudents = response.data.totalStudents || 0;
        this.totalDepartments = response.data.totalDepartments || 0;
      } catch(error) {
        this.error = 'Failed to load non-teaching dashboard data';
        console.error("Error fetching non-teaching dashboard data:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async initializeNonTeachingDashboard(roleId) {
      await this.fetchNonTeachingDashboardData(roleId);
    },
  },
});
