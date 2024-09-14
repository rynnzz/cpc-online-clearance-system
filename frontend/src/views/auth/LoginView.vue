<template>
  <div class="min-h-screen bg-cover bg-center flex items-center justify-center" style="background-image: url('/src/assets/login-background.png');">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-6 text-center">Welcome!</h2>
      <form @submit.prevent="handleLogin">
        <!-- Email Input -->
        <div class="mb-4 relative">
          <input
            type="email"
            v-model="email"
            class="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            required
          />
          <!-- Email Icon -->
          <i class="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
        </div>

        <!-- Password Input -->
        <div class="mb-6 relative">
          <input
            :type="passwordVisible ? 'text' : 'password'"
            v-model="password"
            class="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            required
          />
          <!-- Password Icon -->
          <i class="fas fa-lock absolute left-3 top-3 text-gray-400"></i>

          <!-- Show Password Toggle Button -->
          <button
            type="button"
            @click="togglePassword"
            class="absolute right-3 top-3 text-gray-400 focus:outline-none"
          >
            <i :class="passwordVisible ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
          </button>
        </div>

        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
          Login
        </button>
      </form>
      <div class="text-center mt-4">
        <a href="#" class="text-blue-500">Forgot Password? Click Here!</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Adjust the path as needed
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const passwordVisible = ref(false);
const router = useRouter();
const authStore = useAuthStore();

// Toggle password visibility
const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};

// Handle login and redirect based on user role
const handleLogin = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value });

    // Check the role from the store
    const { userRole } = authStore;
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed:', error.message);
    alert('Invalid credentials');
  }
};

</script>
