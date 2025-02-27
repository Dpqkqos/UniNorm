<template>
    <div class="app-container">
      <!-- Форма регистрации (только для новых пользователей) -->
      <RegistrationForm
        v-if="!isRegistered"
        @registration-complete="handleRegistrationComplete"
      />
  
      <!-- Основной интерфейс (для зарегистрированных пользователей) -->
      <MainInterface v-else />
    </div>
  </template>
  
  <script>
  import RegistrationForm from './components/RegistrationForm.vue';
  import MainInterface from './components/MainInterface.vue';
  
  export default {
    components: {
      RegistrationForm,
      MainInterface,
    },
    data() {
      return {
        isRegistered: false, // Флаг, показывающий, прошел ли пользователь регистрацию
      };
    },
    created() {
      // Проверяем, есть ли данные о регистрации в localStorage
      const registrationData = localStorage.getItem('userRegistration');
      if (registrationData) {
        this.isRegistered = true;
      }
    },
    methods: {
      handleRegistrationComplete() {
        // Устанавливаем флаг регистрации и сохраняем данные в localStorage
        this.isRegistered = true;
        localStorage.setItem('userRegistration', 'completed');
      },
    },
  };
  </script>
  
