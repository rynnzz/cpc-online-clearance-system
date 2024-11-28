<template>
  <transition name="modal-fade" appear>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-start overflow-y-auto">
      <div class="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-4xl transform transition-transform duration-300 scale-95">
        <!-- Modal Header -->
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-white">Welcome to the First-Time Setup!</h2>
          <p class="text-lg text-gray-400 mt-2">Please complete this setup to get started.</p>
        </div>

        <form @submit.prevent="submitSetup">
                    <!-- Multi-Role Selection -->
                    <div class="mb-6">
  <h3 class="text-xl font-semibold text-white">Step 1: Select Your Role(s)</h3>
  <p class="text-sm text-gray-400 mt-2">Choose one or more roles that best describe your position.</p>

  <!-- Department Heads -->
  <div class="mt-4">
    <h4 class="text-lg font-semibold text-gray-200 mb-2">Department Heads</h4>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Department Head - BSIT"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Department Head - BSIT</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Department Head - BSHM"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Department Head - BSHM</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Department Head - BEED"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Department Head - BEED</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Department Head - BSED"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Department Head - BSED</span>
      </label>
    </div>
  </div>

  <!-- Teaching Roles -->
  <div class="mt-6">
    <h4 class="text-lg font-semibold text-gray-200 mb-2">Teaching Roles</h4>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Full Time"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Full Time</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Part Time"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Part Time</span>
      </label>
    </div>
  </div>

  <!-- Non-Teaching Staff -->
  <div class="mt-6">
    <h4 class="text-lg font-semibold text-gray-200 mb-2">Non-Teaching Staff</h4>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Registrar"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Registrar</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Librarian"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Librarian</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="SAO/SSG Adviser"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>SAO/SSG Adviser</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Clinic"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Clinic</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value="Accounting"
          v-model="selectedRoles"
          class="checkbox checkbox-primary"
        />
        <span>Accounting</span>
      </label>
    </div>
  </div>
</div>


          <!-- Step 1: Department, Year, Section, and Subjects -->
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-white mb-2">Step 2: Section Information</h3>
  <div class="flex items-center space-x-4 mb-4">
    <label class="flex items-center space-x-2">
      <input
        type="checkbox"
        v-model="handlesSection"
        class="checkbox checkbox-primary"
      />
      <span class="text-gray-300">I handle sections</span>
    </label>
  </div>
  <div v-if="handlesSection">
            <div v-for="(section, index) in setupData.sections" :key="index" class="mt-4 p-4 border border-gray-600 rounded-lg">
              <!-- Department -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-gray-300 mb-2">Department:</label>
                <select
                  v-model="section.department"
                  @change="filterSubjectsByDepartmentAndSemester(index)"
                  class="input input-bordered w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md"
                  required
                >
                  <option value="" disabled>Select Department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>

              <!-- Year Level -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-gray-300 mb-2">Year Level:</label>
                <select
                v-model="section.year"
                @change="filterSubjectsByDepartmentAndSemester(index)"
                class="input input-bordered w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md" required>
                  <option value="" disabled>Select Year Level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <!-- Section -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-gray-300 mb-2">Section:</label>
                <input
                  v-model="section.section"
                  type="text"
                  placeholder="Year and Section (e.g., 1A)"
                  class="input input-bordered w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md"
                  required
                />
              </div>

              <!-- Subjects -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-gray-300 mb-2">Available Subjects:</label>
                <div v-if="!section.department || !section.year" class="text-gray-400">
                  Please select a department and year level first to view available subjects.
                </div>
                <div v-else-if="filteredSubjects[index]?.length > 0" class="grid grid-cols-2 gap-4">
                  <div v-for="subject in filteredSubjects[index]" :key="subject.id" class="flex items-center">
                    <input type="checkbox" :value="subject.name" v-model="section.subjects" />
                    <label class="ml-2 text-gray-300">{{ subject.name }}</label>
                  </div>
                </div>
                <div v-else class="text-gray-400">No subjects available for the selected department and current semester.</div>
              </div>

              <!-- Remove Section Button -->
              <div class="flex justify-end">
                <button type="button" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md" @click="removeSection(index)">Remove Section</button>
              </div>
            </div>

          <!-- Add New Section Button -->
          <div class="flex justify-start mt-2 mb-6">
            <button type="button" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md" @click="addSection">Add Another Section</button>
          </div>
          </div>
          </div>

          <!-- Step 3: Signature -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-white">Step 3: Draw Your Signature</h3>
            <div class="border-2 border-gray-300 rounded-lg p-4 bg-gray-800">
              <vue-signature ref="signaturePad" :options="signatureOptions" class="w-full h-80 border border-gray-600 rounded-md"></vue-signature>
              <button type="button" class="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md" @click="clearSignature">Clear Signature</button>
            </div>
          </div>

          <!-- Step 4: Complete Setup -->
          <div class="flex justify-end">
            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-lg">Complete Setup</button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>



<script setup>
import { ref, computed, onMounted } from "vue";
import { useSubjectStore } from "@/stores/subjectStore";
import { useTeacherStore } from "@/stores/teacherStore";
import { useSemesterStore } from "@/stores/semesterStore";
import VueSignature from "vue-signature";

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
});

const subjectStore = useSubjectStore();
const teacherStore = useTeacherStore();
const semesterStore = useSemesterStore();

const setupData = ref({
  sections: [
    {
      department: "",
      year: "",
      section: "",
      subjects: [],
    },
  ],
});

const selectedRoles = ref([]); // Array to hold selected roles for the teacher
const handlesSection = ref(false);
const currentSemester = ref(""); // Store the current semester
const filteredSubjects = ref([]); // Array to hold filtered subjects for each section
const signatureOptions = ref({
  penColor: "black",
  backgroundColor: "rgba(0, 0, 0, 0)",
});
const signaturePad = ref(null);

// Fetch subjects, departments, and current semester on mount
onMounted(async () => {
  try {
    await subjectStore.getAllSubjects(); // Fetch all subjects
    const semesterResponse = await semesterStore.getSemester(); // Fetch current semester from API

    if (typeof semesterResponse === "string") {
      currentSemester.value = semesterResponse; // Handle plain string response
    } else if (Array.isArray(semesterResponse) && semesterResponse.length > 0) {
      currentSemester.value = semesterResponse[0].semester; // Handle array response
    } else {
      console.warn("Unexpected semester response format:", semesterResponse);
      currentSemester.value = "1st Semester"; // Default fallback
    }
  } catch (error) {
    console.error("Error fetching semester:", error);
    currentSemester.value = "1st Semester"; // Default fallback if API fails
  }
});

const departments = computed(() => subjectStore.departments || []); // Fallback if no departments are available

// Filter subjects for a specific section based on department and semester
const filterSubjectsByDepartmentAndSemester = (index) => {
  const departmentId = setupData.value.sections[index].department;
  const yearLevel = setupData.value.sections[index].year; // Get the selected year level

  if (!departmentId || !yearLevel) {
    // If department or year level is not selected, reset the filtered subjects
    filteredSubjects.value[index] = [];
    return;
  }

  // Map currentSemester to a numeric equivalent for comparison
  const semesterMapping = {
    "1st semester": 1,
    "2nd semester": 2,
  };

  const currentSemesterNumeric = semesterMapping[currentSemester.value.toLowerCase()] || 1; // Default to 1 if undefined

  // Filter subjects by department, semester, and year level
  filteredSubjects.value[index] = subjectStore.subjects.filter(
    (subject) =>
      subject.department_id === departmentId &&
      subject.semester === currentSemesterNumeric && // Match semester as a number
      subject.year === yearLevel // Match year level
  );

  console.log("Filtered Subjects for Section", index, ":", filteredSubjects.value[index]);
};

// Add a new section
const addSection = () => {
  setupData.value.sections.push({
    department: "",
    year: "",
    section: "",
    subjects: [],
  });
  filteredSubjects.value.push([]);
};

// Remove a section
const removeSection = (index) => {
  if (setupData.value.sections.length > 1) {
    setupData.value.sections.splice(index, 1);
    filteredSubjects.value.splice(index, 1);
  } else {
    alert("At least one section is required.");
  }
};

// Clear signature
const clearSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clear();
  }
};

// Submit setup data
const submitSetup = async () => {
  if (selectedRoles.value.length === 0) {
    alert("Please select at least one role.");
    return;
  }
  try {
    let sections = [];
    if (handlesSection.value) {
      sections = setupData.value.sections.map((section) => ({
        department: section.department,
        year: section.year,
        section: section.section,
        subjects: section.subjects,
      }));
    }

    const signature = signaturePad.value.save();

    const payload = {
      handlesSection: handlesSection.value, // Include whether the teacher handles sections
      sections,
      signature,
      roles: selectedRoles.value,
    };
    await teacherStore.addYearSection(payload);
    localStorage.setItem('isFirstLogin', '0');
    alert("Setup completed successfully!");
    props.closeModal();
  } catch (error) {
    console.error("Error during setup submission:", error);
    alert("Failed to complete setup. Please try again.");
  }
};
</script>


<style scoped>
</style>
