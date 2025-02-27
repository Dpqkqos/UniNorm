<template>
  <div class="app-container">
    <!-- Приветственное сообщение -->
    <transition name="fade" @after-leave="showRegistrationText = true">
      <div v-if="showGreeting" class="greeting-message">
        <h2>Привет!</h2>
      </div>
    </transition>
    <!-- Сообщение о регистрации -->
    <transition name="fade" @after-leave="showRegistrationForm = true">
      <div v-if="showRegistrationText" class="registration-text">
        <h3>Чтобы продолжить, пройди регистрацию.</h3>
      </div>
    </transition>
    <!-- Форма регистрации -->
    <transition name="slide-up">
      <div v-if="showRegistrationForm" class="registration-container">
        <h2>Регистрация</h2>
        <form @submit.prevent="submitRegistration">
          <div class="form-group">
            <label for="lastName">Фамилия:</label>
            <input type="text" id="lastName" v-model="lastName" required />
          </div>
          <div class="form-group">
            <label for="firstName">Имя:</label>
            <input type="text" id="firstName" v-model="firstName" required />
          </div>
          <div class="form-group">
            <label for="middleName">Отчество:</label>
            <input type="text" id="middleName" v-model="middleName" />
          </div>
          <div class="form-group">
            <label for="birthDate">Дата рождения:</label>
            <input type="date" id="birthDate" v-model="birthDate" required />
          </div>
          <div class="form-group">
            <label for="birthTime">Время рождения:</label>
            <input type="time" id="birthTime" v-model="birthTime" required />
          </div>
          <button type="submit" class="submit-button">Зарегистрироваться</button>
        </form>
        <!-- Прогноз на день -->
        <div v-if="forecast" class="forecast-section">
          <h3>Ваш прогноз на день:</h3>
          <p>{{ forecast }}</p>
        </div>
        <!-- Таймер -->
        <div class="timer">
          <p>Время с момента регистрации: {{ formattedTime }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showGreeting: true,
      showRegistrationText: false,
      showRegistrationForm: false,
      lastName: "",
      firstName: "",
      middleName: "",
      birthDate: "",
      birthTime: "",
      forecast: "",
      startTime: null,
      currentTime: null,
      timerInterval: null,
    };
  },
  computed: {
    formattedTime() {
      if (!this.startTime || !this.currentTime) return "00:00:00";
      const diff = Math.floor((this.currentTime - this.startTime) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
  },
  watch: {
    showRegistrationText(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.showRegistrationText = false; // Скрыть текст через 3 секунды
        }, 3000);
      }
    },
  },
  methods: {
    async submitRegistration() {
      const userData = {
        lastName: this.lastName,
        firstName: this.firstName,
        middleName: this.middleName,
        birthDate: this.birthDate,
        birthTime: this.birthTime,
      };
      try {
        const response = await fetch("http://127.0.0.1:8000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error("Ошибка регистрации");
        const data = await response.json();
        this.forecast = data.forecast;
        this.startTimer();
      } catch (error) {
        console.error("Ошибка при регистрации:", error);
        alert("Не удалось зарегистрироваться. Попробуйте снова.");
      }
    },
    startTimer() {
      this.startTime = Date.now();
      this.currentTime = Date.now();
      this.timerInterval = setInterval(() => {
        this.currentTime = Date.now();
      }, 1000);
    },
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },
  mounted() {
    setTimeout(() => {
      this.showGreeting = false; // Скрыть приветствие через 3 секунды
    }, 3000);
  },
};
</script>

<style scoped>
/* Основные стили */
* {
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html,
body {
  height: 100vh;
  line-height: 1.6;
  background: #fff;
  overflow: hidden;
}
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.registration-text,
.registration-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
}
.greeting-message h2 {
  font-size: 2rem;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #f700ff, #e100ff, #6708ff);
  color: transparent;
  -webkit-background-clip: text;
}
.registration-text h3 {
  font-size: 1.5rem;
  background: linear-gradient(45deg, #f700ff, #e100ff, #6708ff);
  color: transparent;
  -webkit-background-clip: text;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.slide-up-enter-from {
  transform: translate(-50%, 100%);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translate(-50%, -50%);
  opacity: 1;
}


/* Стили формы регистрации */
.registration-container {
  width: 400px;
  padding: 20px;
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 4s ease infinite;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.registration-container h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #fff;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}
.submit-button {
  width: 100%;
  padding: 10px;
  background: #fb0eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.submit-button:hover {
  background: #e62ee6;
}

/* Секция прогноза */
.forecast-section {
  margin-top: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* Таймер */
.timer {
  margin-top: 20px;
  font-size: 1rem;
  color: #fff;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>