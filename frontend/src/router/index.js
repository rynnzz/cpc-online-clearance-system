import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/auth/LoginView.vue';
import UnauthorizedView from '../views/UnauthorizedView.vue'; // Import UnauthorizedView
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
      meta: { requiresAuth: true, allowedRoles: ['admin'] }
    },
    {
      path: '/manage-subjects',
      name: 'manage-subjects',
      component: () => import('../views/admin/ManageSubjectsView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin'] }
    },
    {
      path: '/manage-teacher-accounts',
      name: 'manage-teacher-accounts',
      component: () => import('../views/admin/ManageTeacherAccountsView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin'] }
    },
    {
      path: '/manage-student-accounts',
      name: 'manage-student-accounts',
      component: () => import('../views/admin/ManageStudentAccountsView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin'] }
    },
    {
      path: '/view-clearance',
      name: 'view-clearance',
      component: () => import('../views/student/ClearanceView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['student'] }
    },
    {
      path: '/upload-document',
      name: 'upload-document',
      component: () => import('../views/student/UploadDocumentView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['student'] }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/student/StudentProfileView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['student'] }
    },
    {
      path: '/approve-clearance',
      name: 'approve-clearance',
      component: () => import('../views/teacher/ApproveClearanceView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['teacher'] }
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView,
      meta: { requiresAuth: true } // Only accessible when logged in
    },
    {
      path: '/page-not-found',
      name: 'page-not-found',
      component: () => import('../views/PageNotFoundView.vue'),
      meta: { requiresAuth: true } // Only accessible when logged in
    },
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      redirect: { name: 'page-not-found' }
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
  const userRole = authStore.userRole; // Assume user role is stored in authStore

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isTokenValid(token)) {
      authStore.logout(); // Optionally clear token from store
      next({ name: 'login' });
    } else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
      // If the user role is not allowed, redirect to the unauthorized page
      next({ name: 'unauthorized' });
    } else {
      next(); // Proceed to the route if the role matches
    }
  } else if (to.matched.some(record => record.meta.requiresGuest) && isTokenValid(token)) {
    next({ name: 'page-not-found' });
  } else {
    next();
  }
});

export default router;
