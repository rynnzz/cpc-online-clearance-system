import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import { jwtDecode } from 'jwt-decode';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
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
      path: '/students-status',
      name: 'students-status',
      component: () => import('../views/admin/StudentsStatusView.vue'),
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
    },
  ]
})

function isTokenValid(token) {
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      return false; // Token is expired
    }
    return true;
  } catch (e) {
    return false; // Invalid token
  }
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isTokenValid(token)) {
      next('/'); // Redirect to login if token is not valid
    } else {
      next(); 
    }
  } else {
    next();
  }
});

export default router
