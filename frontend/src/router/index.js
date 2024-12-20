import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/auth/LoginView.vue';
import UnauthorizedView from '../views/UnauthorizedView.vue';
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
      path: '/profile',
      name: 'profile',
      component: () => import('../views/student/StudentProfileView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['student'] }
    },
    {
      path: '/teacher-profile',
      name: 'teacher-profile',
      component: () => import('../views/teacher/TeacherProfileView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['teacher'] }
    },
    {
      path: '/subject-clearance',
      name: 'subject-clearance',
      component: () => import('../views/teacher/SubjectClearanceView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['Full Time', 'Part Time'] }
    },
    {
      path: '/administrative-clearance',
      name: 'administrative-clearance',
      component: () => import('../views/teacher/AdministrativeClearanceView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['Department Head - BSIT', 'Department Head - BEED', 'Department Head - BSHM', 'Department Head - BSED', 'Accounting', 'Librarian', 'SAO/SSG Adviser', 'Guidance Counselor', 'Registrar', 'Clinic'] }
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
    const { exp } = decodeJwt(token);
    return Date.now() < exp * 1000;
  } catch (e) {
    return false;
  }
}

// Global navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = authStore.token || localStorage.getItem('token');
  const userRole = authStore.userRole;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isTokenValid(token)) {
      authStore.logout();
      next({ name: 'login' });
    } else if (to.meta.allowedRoles && !to.meta.allowedRoles.some(role => userRole.includes(role))) {
      next({ name: 'unauthorized' });
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
