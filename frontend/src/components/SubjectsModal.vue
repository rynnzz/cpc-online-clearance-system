<template>
  <div class="modal modal-open" v-if="isOpen">
    <div class="modal-box bg-gray-800 text-gray-100">
      <h2 class="text-lg font-bold">Subjects per Year & Section</h2>
      <div class="py-4">
        <ul>
          <li v-for="(item, index) in yearSectionSubjects" :key="index">
            <strong>{{ item.course_year_and_section }}:</strong>
            <ul class="p-3">
              <li class="p-1" v-for="(subject, idx) in item.subjects" :key="idx">{{ subject }}</li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="modal-action">
        <button class="btn btn-error" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
  yearSectionSubjects: Array
});
</script>

<style scoped>
.modal {
  backdrop-filter: blur(5px);
}
</style>
