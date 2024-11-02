<template>
  <div class="min-h-screen bg-cover bg-base-400 bg-center flex items-center justify-center">
    <div class="bg-base-100 p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-6 text-center text-white">Welcome!</h2>
      <form @submit.prevent="handleLogin">
        <!-- Email Input -->
        <div class="mb-4 relative">
          <input
            type="email"
            v-model="email"
            class="input w-full text-white px-10 bg-gray-700 border focus:outline-none focus:ring focus:ring-blue-400"
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
            class="input w-full text-white px-10 bg-gray-700 border focus:outline-none focus:ring focus:ring-blue-400"
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

        <!-- Login Button with Loading State -->
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary w-full flex justify-center items-center"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>Login</span>
        </button>
      </form>
      <div class="text-center mt-4">
        <span class="text-blue-500">Forgot Password? <a href="#" class="cursor-pointer hover:underline">Click Here!</a></span>
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
const loading = ref(false); // Loading state
const router = useRouter();
const authStore = useAuthStore();

// Toggle password visibility
const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};

// Handle login with a delay for redirection
const handleLogin = async () => {
  loading.value = true; // Set loading to true when login starts
  try {
    await authStore.login({ email: email.value, password: password.value });
    console.log('Login successful, redirecting...')

    // Simulate a delay of 2 seconds before redirecting
    setTimeout(() => {
      router.push('/dashboard');
      loading.value = false; // Reset loading state after delay
    }, 2000); // 2000ms = 2 seconds
  } catch (error) {
    console.error('Login failed:', error.message);
    alert('Invalid credentials');
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
