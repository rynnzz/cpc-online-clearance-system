<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black flex items-center justify-center">
    <!-- Decorative Header -->
    <div class="absolute top-10 text-center">
      <h1 class="text-5xl font-extrabold text-white">CPC Online Clearance</h1>
      <p class="text-lg text-gray-300 mt-2">Secure your clearance with ease</p>
    </div>

    <!-- Login Card -->
    <div class="card w-full max-w-md bg-gray-700 shadow-2xl p-6">
      <h2 class="card-title text-center text-3xl font-bold mb-6">Welcome Back!</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Student ID / Email Input -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-white">Student ID or Email</span>
          </label>
          <div class="relative">
            <input
              type="text"
              v-model="loginInput"
              placeholder="Enter your ID or Email"
              class="input input-bordered w-full pr-10"
              required
            />
            <i class="fas fa-user absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <!-- Password Input -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-white">Password</span>
          </label>
          <div class="relative">
            <input
              :type="passwordVisible ? 'text' : 'password'"
              v-model="password"
              placeholder="Enter your password"
              class="input input-bordered w-full pr-10"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
            >
              <i :class="passwordVisible ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </button>
          </div>
        </div>

        <!-- Login Button -->
        <div class="form-control mt-4">
          <button
            type="submit"
            class="btn btn-primary w-full"
            :class="{ loading: loading }"
            :disabled="loading"
          >
            <span v-if="!loading">Login</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Decorative Footer -->
    <div class="absolute bottom-5 text-center">
      <p class="text-gray-400 text-sm">&copy; 2024 CPC Online Clearance. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Adjust the path as needed
import { useRouter } from 'vue-router';

const loginInput = ref(''); // Dynamic input for Student ID or Email
const password = ref('');
const passwordVisible = ref(false);
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

// Toggle password visibility
const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};

// Handle login with support for Student ID or Email
const handleLogin = async () => {
  loading.value = true; // Set loading to true when login starts
  try {
    // Send loginInput as a single field regardless of email or student ID
    const loginPayload = {
      loginInput: loginInput.value, // Pass email or student ID as loginInput
      password: password.value,
    };

    // Pass the payload to authStore
    await authStore.login(loginPayload);

    // Simulate a delay of 2 seconds before redirecting
    setTimeout(() => {
      router.push('/dashboard');
      loading.value = false; // Reset loading state after delay
    }, 2000); // 2000ms = 2 seconds
  } catch (error) {
    console.error('Login failed:', error.message);
    alert('Invalid Student ID/Email or Password');
    loading.value = false; // Reset loading state on failure
  }
};

</script>

<style scoped>
/* Loader CSS for the button */
.loader {
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  border-top: 3px solid #3498db;
  width: 16px;
  height: 16px;
  -webkit-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
}

@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
