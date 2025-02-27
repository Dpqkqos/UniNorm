<template>
  <div class="app-container">
    <!-- Загрузчик -->
    <div v-if="loading" class="loader">Загрузка...</div>

    <!-- Основной контент -->
    <template v-else>
      <!-- Профиль -->
      <transition name="slide-up" appear>
        <div class="profile-section">
          <h1 class="main-title">Личная карточка<span class="accent">✦</span></h1>
          <div class="profile-card">
            <img :src="user.avatar" class="user-avatar" alt="Аватар" />
            <div class="user-info">
              <h2 class="user-name">{{ user.fullName }}</h2>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="icon">✦</span>
                  {{ user.daysOnPlatform }} {{ daysText }} на платформе
                </div>
                <div class="stat-item">
                  <span class="icon">✦</span>
                  Ваш запрос: {{ user.request }}
                </div>
              </div>
              <!-- Кнопка "Изменить запрос" -->
              <div class="button-container">
                <button 
                  @click="toggleRequestWindow" 
                  :class="{ 'expanded': showRequestModal }" 
                  class="change-request-button"
                >
                  {{ showRequestModal ? 'Закрыть' : 'Изменить запрос' }}
                </button>
                <transition name="expand">
                  <div v-if="showRequestModal" class="request-window">
                    <div class="requests-list">
                      <button
                        v-for="(request, index) in requests"
                        :key="index"
                        @click="selectRequest(request)"
                        class="request-item"
                      >
                        {{ request }}
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Прогноз -->
      <transition name="slide-up" appear>
        <div class="forecast-section">
          <h2 class="section-title">Прогноз на день</h2>
          <div class="forecast-card">
            <div class="forecast-content">
              <span class="forecast-icon">◎</span>
              <p>{{ forecast || 'Сегодня будет прекрасный день!' }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Эмоции -->
      <transition name="slide-up" appear>
        <div class="emotions-section">
          <div class="emotions-header">
            <h2 class="section-title">
              <span class="title-line">Ведение эмоционального</span>
              <span class="title-line">состояния<span class="accent">✦</span></span>
            </h2>
            <!-- Кнопка "Добавить эмоцию" -->
            <div class="button-container">
              <button 
                @click="toggleEmotionWindow" 
                :class="{ 'expanded': showEmotionModal }" 
                class="add-button"
              >
                {{ showEmotionModal ? 'Закрыть' : '+ Добавить' }}
              </button>
              <transition name="expand">
                <div v-if="showEmotionModal" class="emotion-window">
                  <textarea 
                    v-model="newEmotion" 
                    placeholder="Сегодня я чувствую..."
                    class="styled-textarea"
                  ></textarea>
                  <button @click="addEmotion" class="save-btn">Сохранить</button>
                </div>
              </transition>
            </div>
          </div>

          <div class="emotions-table">
            <div class="table-header">
              <div class="day-col">День</div>
              <div class="emotion-col">Эмоциональное состояние</div>
              <div class="action-col"></div>
            </div>

            <transition-group name="list" tag="div">
              <div 
                v-for="(emotion, index) in reversedEmotions" 
                :key="emotion.id" 
                class="emotion-row"
              >
                <div class="day-col">{{ totalEmotions - index }}</div>
                <div class="emotion-col">{{ emotion.state }}</div>
                <div class="action-col">
                  <button 
                    class="edit-btn" 
                    @click="openEditModal(index)"
                  >
                    ✎
                  </button>
                  <button 
                    class="delete-btn" 
                    @click="deleteEmotion(emotion.id)"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      showEmotionModal: false,
      showRequestModal: false,
      newEmotion: "",
      forecast: "",
      user: {
        id: null,
        fullName: "Пользователь",
        avatar: "",
        emotions: [],
        daysOnPlatform: 0,
        request: "Любовь",
      },
      requests: [
        'Любовь',
        'Карьера',
        'Здоровье',
        'Финансы',
        'Саморазвитие',
        'Отношения'
      ]
    };
  },
  computed: {
    reversedEmotions() {
      return [...this.user.emotions].reverse();
    },
    totalEmotions() {
      return this.user.emotions.length;
    },
    daysText() {
      const days = this.user.daysOnPlatform;
      if (days % 10 === 1 && days % 100 !== 11) return "день";
      if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return "дня";
      return "дней";
    }
  },
  methods: {
    async initializeApp() {
      try {
        await this.initTelegramUser();
        await this.loadUserData();
      } catch (error) {
        console.error("Ошибка инициализации:", error);
      } finally {
        this.loading = false;
      }
    },

    initTelegramUser() {
      return new Promise((resolve, reject) => {
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          const user = tg.initDataUnsafe?.user;
          if (user) {
            this.user.id = user.id;
            this.user.fullName = `${user.first_name} ${user.last_name}`.trim() || "Пользователь";
            this.user.avatar = user.photo_url || "";
            tg.expand(); // Развернуть приложение на весь экран
            tg.enableClosingConfirmation(); // Включить подтверждение закрытия
            resolve();
          } else {
            reject("Данные пользователя Telegram не доступны");
          }
        } else {
          reject("Telegram WebApp не найден");
        }
      });
    },

    async loadUserData() {
      try {
        // Загрузка данных пользователя
        const userResponse = await fetch(`http://127.0.0.1:8000/user/${this.user.id}`);
        if (!userResponse.ok) throw new Error("Ошибка загрузки пользователя");
        const userData = await userResponse.json();
        this.user = { ...this.user, ...userData };

        // Загрузка эмоций пользователя
        const emotionsResponse = await fetch(`http://127.0.0.1:8000/emotions/${this.user.id}`);
        if (!emotionsResponse.ok) throw new Error("Ошибка загрузки эмоций");
        const emotionsData = await emotionsResponse.json();
        this.user.emotions = emotionsData;
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    },

    async addEmotion() {
      if (!this.newEmotion.trim()) {
        this.showAlert("Поле эмоции не может быть пустым!");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/emotion/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: this.user.id,
            state: this.newEmotion
          })
        });

        if (!response.ok) throw new Error("Ошибка добавления эмоции");

        const emotion = await response.json();
        this.user.emotions.push(emotion);
        this.newEmotion = "";
        this.showEmotionModal = false;
      } catch (error) {
        console.error("Ошибка при добавлении эмоции:", error);
        this.showAlert("Не удалось добавить эмоцию. Попробуйте снова.");
      }
    },

    async deleteEmotion(emotionId) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/emotion/${emotionId}`, {
          method: "DELETE"
        });

        if (!response.ok) throw new Error("Ошибка удаления эмоции");

        this.user.emotions = this.user.emotions.filter(e => e.id !== emotionId);
      } catch (error) {
        console.error("Ошибка удаления эмоции:", error);
        this.showAlert("Не удалось удалить эмоцию. Попробуйте снова.");
      }
    },

    async generateForecast() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/generate-forecast/${this.user.id}`);
        if (!response.ok) throw new Error("Ошибка генерации прогноза");

        const data = await response.json();
        this.forecast = data.forecast;
      } catch (error) {
        console.error("Ошибка при генерации прогноза:", error);
        this.showAlert("Не удалось сгенерировать прогноз. Попробуйте снова.");
      }
    },

    toggleEmotionWindow() {
      this.showEmotionModal = !this.showEmotionModal;
    },

    toggleRequestWindow() {
      this.showRequestModal = !this.showRequestModal;
    },

    selectRequest(request) {
      this.user.request = request;
      this.showRequestModal = false;
    },

    showAlert(message) {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(message);
      } else {
        alert(message);
      }
    }
  },
  mounted() {
    this.initializeApp();
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100vh;
  font-family: 'Montserrat', sans-serif;
  line-height: 1.6;
  background: #fff;
  background-size: 400% 400%;
  overflow: auto;
}

.app-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow-y: auto;
  height: 100vh;
  scroll-behavior: smooth;
}

.button-container {
  position: relative;
  width: 100%;
  margin-top: 15px;
}

.change-request-button,
.add-button {
  width: 100%;
  padding: 12px 24px;
  background: #ff0e6b;
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.change-request-button.expanded,
.add-button.expanded {
  border-radius: 25px 25px 0 0;
  box-shadow: none;
}

.request-window,
.emotion-window {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  border-radius: 0 0 25px 25px;
  overflow: hidden;
  z-index: 10;
  transform-origin: top;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.requests-list,
.emotion-window {
  padding: 15px;
}

.request-item,
.save-btn {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #fb0eff;
  color: white;
  text-align: center;
  transition: background 0.3s ease;
  margin-bottom: 5px;
}

.request-item:hover,
.save-btn:hover {
  background: #e62ee6;
}

.emotion-window textarea {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  color: white;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
  position: absolute;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.4s ease;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loader {
  color: #fff;
  font-size: 1.5rem;
  text-align: center;
}

.profile-section {
  margin-bottom: 2rem;
}

.accent {
  color: #ffcc26;
}

.main-title {
  text-align: center;
  color: #000;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.profile-card {
  text-align: center;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 4s ease infinite;
  border-radius: 10px;
  position: relative;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.user-info {
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-name {
  text-align: center;
  font-size: 1.2rem;
}

.user-stats {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item {
  text-align: center;
  align-items: center;
  gap: 5px;
  font-weight: 600;
}

.icon {
  font-size: 1.2rem;
  color: #ffcc26;
}

.forecast-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #000;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.forecast-card {
  padding: 15px;
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 4s ease infinite;
  border-radius: 10px;
  color: #fff;
}

.forecast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.forecast-icon {
  font-size: 1.5rem;
}

.emotions-section {
  margin-bottom: 2rem;
}

.emotions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.emotions-table {
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 4s ease infinite;
  border-radius: 10px;
  padding: 10px;
}

.table-header, .emotion-row {
  text-align: center;
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #fff;
}

.table-header {
  font-weight: bold;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.day-col {
  flex: 1;
  min-width: 50px;
}

.emotion-col {
  flex: 3;
  min-width: 150px;
}

.action-col {
  display: flex;
  justify-content: flex-end;
  width: 80px;
  gap: 8px;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff3b3b;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.edit-btn {
  background: none;
  border: none;
  color: #ffcc26;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.emotions-header .section-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.emotions-header .section-title .title-line {
  display: inline-block;
}

.emotions-header .section-title .accent {
  margin-left: 4px;
}

@media (max-width: 600px) {
  .emotions-header .section-title {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .emotions-header .section-title .title-line {
    display: inline;
  }

  .emotions-header .section-title .accent {
    margin-left: 0;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.input-group label {
  font-size: 0.9rem;
  color: #fff;
  margin-bottom: 3px;
}

.input-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.requests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.request-item {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #fb0eff;
  color: white;
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