import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/auth/LoginView.vue';
import { decodeJwt } from 'jose';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/approve-requests',
      name: 'approve-requests',
      component: () => import('../views/admin/ApproveRequestsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/manage-subjects',
      name: 'manage-subjects',
      component: () => import('../views/admin/ManageSubjectsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/manage-teacher-accounts',
      name: 'manage-teacher-accounts',
      component: () => import('../views/admin/ManageTeacherAccountsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/manage-student-accounts',
      name: 'manage-student-accounts',
      component: () => import('../views/admin/ManageStudentAccountsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/view-clearance',
      name: 'view-clearance',
      component: () => import('../views/student/ClearanceView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/upload-document',
      name: 'upload-document',
      component: () => import('../views/student/UploadDocumentView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/student/StudentProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/approve-clearance',
      name: 'approve-clearance',
      component: () => import('../views/teacher/ApproveClearanceView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// Utility function to check if the token is valid
function isTokenValid(token) {
  if (!token) return false;

  try {
    const { exp } = decodeJwt(token); // Decode the JWT
    return Date.now() < exp * 1000; // Check if the token is still valid
  } catch (e) {
    return false; // Token is invalid or decoding failed
  }
}
// Global navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = authStore.token || localStorage.getItem('token');

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isTokenValid(token)) {
      authStore.logout(); // Optionally clear token from store
      next({ name: 'login' });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresGuest) && isTokenValid(token)) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
