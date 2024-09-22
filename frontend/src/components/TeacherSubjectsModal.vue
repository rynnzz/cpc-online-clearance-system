<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50">
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-white">Subjects Taught</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-white transition">
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>

      <div class="max-h-72 overflow-y-auto border border-gray-600 rounded-md p-2 mb-4">
        <ul>
          <li
            v-for="(subject, index) in subjects"
            :key="index"
            class="py-2 px-4 bg-gray-700 rounded mb-2 shadow-sm text-white flex items-center transition duration-150 ease-in-out hover:bg-blue-600"
          >
            <i class="fas fa-book text-blue-400 mr-2"></i>
            <span class="text-base capitalize">{{ subject }}</span>
          </li>
        </ul>
        <div v-if="subjects.length === 0" class="text-center text-gray-500 py-4">
          No subjects available.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  subjects: Array, // Ensure subjects array contains full strings like ['Math', 'Science']
  closeModal: Function,
});
</script>

<style scoped>
/* Optional hover effect for list items */
li:hover {
  background-color: #4b6cb7; /* Darker blue for hover effect */
}
</style>
