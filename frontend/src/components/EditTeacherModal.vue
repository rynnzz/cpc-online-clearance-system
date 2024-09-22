<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-3xl transform transition-transform duration-300 scale-95 overflow-y-auto">
        <h2 class="text-2xl font-semibold mb-4 text-primary">Edit Teacher</h2>

        <!-- Edit Teacher Form -->
        <form @submit.prevent="updateTeacher">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Personal Information Fields -->
            <input v-model="currentTeacher.first_name" type="text" placeholder="First Name" class="input input-bordered w-full" required />
            <input v-model="currentTeacher.middle_name" type="text" placeholder="Middle Name" class="input input-bordered w-full" required />
            <input v-model="currentTeacher.last_name" type="text" placeholder="Last Name" class="input input-bordered w-full" required />
            <input v-model="currentTeacher.email" type="email" placeholder="Email" class="input input-bordered w-full" required />
            <input v-model="currentTeacher.password" type="password" placeholder="Password (optional)" class="input input-bordered w-full" /> <!-- Optional -->
            <input v-model="currentTeacher.yr_and_section" type="text" placeholder="Year And Sections Handled" class="input input-bordered w-full" required />
            <input v-model="currentTeacher.teacher_type" type="text" placeholder="Teacher Type" class="input input-bordered w-full" required />

            <!-- Dynamic Subjects Handled Section -->
            <div class="col-span-2">
              <h3 class="font-semibold mb-2 text-primary">Subjects Handled</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div v-for="subject in subjects" :key="subject.id" class="flex items-center">
                  <input 
                    type="checkbox" 
                    :value="subject.name" 
                    v-model="currentTeacher.subjects" 
                    class="checkbox checkbox-primary" />
                  <label class="ml-2 text-gray-300">{{ subject.name }}</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex justify-end space-x-4">
            <button @click="props.closeModal" type="button" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Teacher</button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useTeacherStore } from '@/stores/teacherStore';
import { useSubjectStore } from '@/stores/subjectStore';

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
  teacher: Object
});

const subjectStore = useSubjectStore();
const teacherStore = useTeacherStore();

const currentTeacher = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  yr_and_section: '',
  teacher_type: '',
  subjects: []
});

const resetCurrentTeacher = () => {
  currentTeacher.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    yr_and_section: '',
    teacher_type: '',
    subjects: []
  };
};

watch(() => props.teacher, (newTeacher) => {
  if (newTeacher) {
    currentTeacher.value = {
      ...newTeacher,
      password: '',
      subjects: Array.isArray(newTeacher.subjects) ? newTeacher.subjects : []
    };
  } else {
    resetCurrentTeacher(); 
  }
}, { immediate: true });

const updateTeacher = async () => {
  try {
    await teacherStore.updateTeacher(currentTeacher.value);
    props.closeModal(); // Close the modal after the update
    resetCurrentTeacher(); // Reset the form after updating
  } catch (error) {
    console.error('Error updating teacher:', error);
  }
};

// Computed property for subjects
const subjects = computed(() => subjectStore.subjects);
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter, .modal-fade-leave-to {
  opacity: 0;
}
</style>
