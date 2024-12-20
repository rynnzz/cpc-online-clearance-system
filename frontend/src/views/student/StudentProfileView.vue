<template>
  <div class="min-h-screen bg-gray-900 flex justify-center items-center">
    <div class="card w-full bg-gray-900">
      <div v-if="loading" class="card-body text-center">
        <h1 class="text-4xl font-bold text-primary">Loading...</h1>
      </div>
      <div v-else class="card-body">
        <h1 class="card-title text-4xl font-bold text-primary mb-8 text-center">
          Account Settings
        </h1>

        <form @submit.prevent="updatePassword" class="space-y-8">
          <!-- Display Student Information -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label for="fullName" class="block text-lg text-white font-semibold mb-2">Full Name</label>
              <p class="w-full text-lg text-accent">{{ student.lastName }}, {{ student.firstName }} </p>
            </div>

            <div>
              <label for="email" class="block text-lg text-white font-semibold mb-2">Email</label>
              <p class="w-full text-lg text-accent">{{ student.email }} </p>
            </div>

            <div>
              <label for="email" class="block text-lg text-white font-semibold mb-2">Course</label>
              <p class="w-full text-lg text-accent">{{ student?.sections?.[0]?.course }} </p>
            </div>

            <div>
              <label for="email" class="block text-lg text-white font-semibold mb-2">Year and Section</label>
              <p class="w-full text-lg text-accent">{{ student?.sections?.[0]?.year }} - {{ student?.sections?.[0]?.section }} </p>
            </div>
          </div>

          <!-- Change Password -->
          <div class="space-y-6">
            <div>
              <label class="label">
                <span class="label-text text-lg font-semibold text-primary">
                  New Password
                </span>
              </label>
              <input
                v-model="password"
                type="password"
                placeholder="Enter new password"
                class="input input-bordered w-full bg-base-200 text-lg"
                required
              />
            </div>

            <div>
              <label class="label">
                <span class="label-text text-lg font-semibold text-primary">
                  Confirm Password
                </span>
              </label>
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                class="input input-bordered w-full bg-base-200 text-lg"
                required
              />
            </div>
          </div>

          <div class="card-actions justify-center mt-8">
            <button
              type="submit"
              class="btn btn-primary w-full max-w-md text-lg"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStudentStore } from "@/stores/studentStore";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const studentStore = useStudentStore();

const student = ref(null); 
const loading = ref(true); 
const password = ref("");
const confirmPassword = ref("");


onMounted(async () => {
  try {
    await studentStore.getStudentInfo(); 
    student.value = studentStore.currentStudent; 
  } catch (error) {
    console.error("Error fetching student details:", error);
    alert("Failed to load student details. Please refresh the page.");
  } finally {
    loading.value = false;
  }
});

// Update password function
const updatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const userId = authStore.userId;  // Assuming the user ID is stored in the currentUser property of authStore
    await authStore.changePassword(userId, password.value,);
    alert("Password updated successfully!");
    password.value = "";
    confirmPassword.value = "";
  } catch (error) {
    console.error("Error updating password:", error);
    alert("Failed to update password. Please try again.");
  }
};
</script>

<style scoped>
</style>
