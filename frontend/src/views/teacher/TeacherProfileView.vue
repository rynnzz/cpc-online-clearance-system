<template>
    <div class="min-h-screen bg-gray-900 flex justify-center items-center px-8 py-10">
      <div class="card w-full max-w-screen-xl p-12 rounded-lg bg-gray-900">
        <!-- Title -->
        <h2 class="text-5xl font-bold mb-12 text-center text-white">Account Settings</h2>
        
        <!-- Form -->
        <form @submit.prevent="updatePassword" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- First Name -->
            <div>
              <label for="firstName" class="block text-lg text-white font-semibold mb-2">First Name</label>
              <p class="w-full text-lg text-accent">{{ teacherData.firstName }}</p>
            </div>
            <!-- Middle Initial -->
            <div>
              <label for="middleName" class="block text-lg text-white font-semibold mb-2">Middle Initial</label>
              <p class="w-full text-lg text-accent">{{ teacherData.middleName }}</p>
            </div>
            <!-- Last Name -->
            <div>
              <label for="lastName" class="block text-lg text-white font-semibold mb-2">Last Name</label>
              <p class="w-full text-lg text-accent">{{ teacherData.lastName }}</p>
            </div>
            <!-- Email -->
            <div>
              <label for="email" class="block text-lg text-white font-semibold mb-2">Email</label>
              <p class="w-full text-lg text-accent">{{ teacherData.email }}</p>
            </div>
          </div>
  
          <!-- Password -->
          <div>
            <label for="password" class="block text-lg text-white font-semibold mb-2">New Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Enter new password"
              class="input input-bordered w-full bg-gray-700 text-lg"
            />
          </div>
  
          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-lg text-white font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm new password"
              class="input input-bordered w-full bg-gray-700 text-lg"
            />
          </div>
  
          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              class="btn btn-primary w-full py-4 text-lg font-semibold"
              :disabled="isUpdating"
            >
              Update Password
            </button>
          </div>
  
          <!-- Messages -->
          <p v-if="updateError" class="text-red-500 mt-6 text-center text-lg">{{ updateError }}</p>
          <p v-if="updateSuccess" class="text-green-500 mt-6 text-center text-lg">{{ updateSuccess }}</p>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, computed } from "vue";
  import { useTeacherStore } from "@/stores/teacherStore";
  import { useAuthStore } from "@/stores/authStore";

  const authStore = useAuthStore();
  
  const teacherStore = useTeacherStore();
  const teacherSubjects = ref([]);
  const password = ref("");
  const confirmPassword = ref("");
  const updateError = ref("");
  const updateSuccess = ref("");
  const isUpdating = ref(false);
  
  onMounted(() => {
    teacherStore.getTeacherInfo().then(() => {
      teacherSubjects.value = teacherStore.currentTeacher.subjects || [];
    });
  });
  
  const teacherData = computed(() => teacherStore.currentTeacher);
  
  const updatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    updateError.value = "Passwords do not match.";
    return;
  }

  try {
    isUpdating.value = true;
    updateError.value = "";
    const userId = teacherData.value.teacherId || authStore.userId; // Use correct identifier
    await authStore.changePassword(userId, password.value);
    updateSuccess.value = "Password updated successfully.";
    password.value = "";
    confirmPassword.value = "";
  } catch (error) {
    updateError.value = "Failed to update password.";
    console.error(error);
  } finally {
    isUpdating.value = false;
  }
};
  </script>
  