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
              <p>{{ user.forecast || 'Сегодня будет прекрасный день!' }}</p>
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
                :key="emotion.day" 
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
                    @click="openDeleteModal(index)"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </transition>

      <!-- Модальное окно редактирования -->
      <transition name="fade">
        <div 
          v-if="showEditModal" 
          class="modal-overlay"
          @click.self="showEditModal = false"
        >
          <div class="modal-content styled-modal">
            <h3>Редактировать состояние</h3>
            <textarea 
              v-model="editEmotionText" 
              placeholder="Сегодня я чувствую..."
            ></textarea>
            <div class="modal-actions">
              <button @click="saveEditedEmotion" class="styled-button">Сохранить</button>
              <button @click="showEditModal = false" class="styled-button">Отмена</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Модальное окно подтверждения удаления -->
      <transition name="fade">
        <div 
          v-if="showDeleteModal" 
          class="modal-overlay"
          @click.self="showDeleteModal = false"
        >
          <div class="modal-content styled-modal">
            <h3>Вы уверены, что хотите удалить запись?</h3>
            <div class="modal-actions">
              <button @click="deleteEmotion" class="styled-button">Удалить</button>
              <button @click="showDeleteModal = false" class="styled-button">Отмена</button>
            </div>
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
      showModal: false,
      showRequestModal: false,
      showEmotionModal: false,
      showEditModal: false,
      showDeleteModal: false,
      newEmotion: '',
      editEmotionText: '',
      isKeyboardOpen: false,
      selectedEmotionIndex: null,
      showRegistrationForm: false, // Исправлено
      requests: ['Любовь', 'Карьера', 'Здоровье', 'Финансы', 'Саморазвитие', 'Отношения'],
      user: {
        id: null,
        fullName: 'Тестовый пользователь',
        avatar: '',
        daysOnPlatform: 1,
        request: 'любовь',
        forecast: '',
        emotions: [],
        birthDate: null,
        birthTime: null,
        registrationDate: null
      },
      registrationForm: { // Исправлено
        firstName: '',
        lastName: '',
        birthDate: '',
        birthTime: ''
      }
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
      const last = days % 10;
      if (days > 10 && days < 20) return 'дней';
      if (last === 1) return 'день';
      if (last > 1 && last < 5) return 'дня';
      return 'дней';
    },
    modalOverlayHeight() {
      const baseHeight = window.innerWidth <= 600 ? 110 : 100;
      const additionalHeight = this.totalEmotions * 5;
      return `${baseHeight + additionalHeight}%`;
    }
  },
  methods: {
    async initializeApp() {
      try {
        await this.initTelegramUser();
        this.loadUserData();
        this.checkRegistration();
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        this.setupFallbackUser();
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
            this.user.id = user.id || this.generateUserId();
            this.user.fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь';
            this.user.avatar = user.photo_url || this.generateAvatar(user.first_name);
            tg.expand();
            tg.enableClosingConfirmation();
            resolve();
          } else {
            reject('Данные пользователя Telegram не доступны');
          }
        } else {
          this.user.id = this.generateUserId();
          resolve();
        }
      });
    },

    toggleRequestWindow() {
      this.showRequestModal = !this.showRequestModal;
    },

    toggleEmotionWindow() {
      this.showEmotionModal = !this.showEmotionModal;
    },

    openEditModal(index) {
      this.selectedEmotionIndex = index;
      this.editEmotionText = this.user.emotions[index].state;
      this.showEditModal = true;
    },

    saveEditedEmotion() {
      if (this.editEmotionText.trim()) {
        this.user.emotions[this.selectedEmotionIndex].state = this.editEmotionText;
        this.showEditModal = false;
        this.saveUserData();
      }
    },

    openDeleteModal(index) {
      this.selectedEmotionIndex = index;
      this.showDeleteModal = true;
    },

    deleteEmotion() {
      this.user.emotions.splice(this.selectedEmotionIndex, 1);
      this.user.emotions.forEach((emotion, i) => {
        emotion.day = i + 1;
      });
      this.showDeleteModal = false;
      this.saveUserData();
    },

    addEmotion() {
      if (this.newEmotion.trim()) {
        this.user.emotions.push({
          day: this.user.emotions.length + 1,
          state: this.newEmotion,
          date: new Date().toISOString()
        });
        this.newEmotion = '';
        this.showEmotionModal = false;
        this.saveUserData();
      }
    },

    selectRequest(request) {
      this.user.request = request.toLowerCase();
      this.showRequestModal = false;
      this.saveUserData();
    },

    generateUserId() {
      return 'user_' + Math.random().toString(36).substr(2, 9);
    },

    checkRegistration() {
      if (!localStorage.getItem(this.user.id)) {
        this.showRegistrationForm = true;
      }
    },

    completeRegistration() {
      if (this.validateRegistrationForm()) {
        this.user = {
          ...this.user,
          fullName: `${this.registrationForm.firstName} ${this.registrationForm.lastName}`.trim(),
          birthDate: this.registrationForm.birthDate,
          birthTime: this.registrationForm.birthTime,
          registrationDate: new Date().toISOString()
        };
        this.saveUserData();
        this.showRegistrationForm = false;
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.close();
        }
      }
    },

    validateRegistrationForm() {
      return (
        this.registrationForm.firstName.trim() &&
        this.registrationForm.lastName.trim() &&
        this.registrationForm.birthDate
      );
    },

    saveUserData() {
      if (this.user.id) {
        localStorage.setItem(this.user.id, JSON.stringify(this.user));
      } else {
        console.warn("ID пользователя не установлен, сохранение невозможно.");
      }
    },

    handleResize() {
      if (window.visualViewport) {
        document.documentElement.style.height = `${window.visualViewport.height}px`;
        window.scrollTo(0, 0);
      }
    },

    generateAvatar(name) {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#B566FF';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((name?.[0] || 'U').toUpperCase(), 50, 50);
      return canvas.toDataURL();
    },

    setupFallbackUser() {
      this.user = {
        ...this.user,
        fullName: 'Тестовый Пользователь',
        avatar: this.generateAvatar('Т')
      };
    },

    loadUserData() {
      const savedData = localStorage.getItem(this.user.id);
      if (savedData) {
        try {
          this.user = JSON.parse(savedData);
          this.updatePlatformDays();
        } catch (e) {
          console.error('Ошибка загрузки данных:', e);
        }
      }
    },

    updatePlatformDays() {
      if (!this.user.registrationDate) return;
      const diff = Date.now() - new Date(this.user.registrationDate).getTime();
      this.user.daysOnPlatform = Math.floor(diff / (1000 * 3600 * 24)) + 1;
      this.saveUserData();
    }
  },
  mounted() {
    this.initializeApp();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
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
  right: 0;
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  animation: gradient 4s ease infinite;
  border-radius: 0 0 25px 25px;
  overflow: hidden;
  z-index: 0;
  transform-origin: top;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.requests-list,
.emotion-window {
  padding: 15px;
}

.request-item,
.save-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #fb0eff;
  color: white;
  text-align: center;
  transition: background 0.3s ease;
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
  animation: gradient 4s ease infinite;
}

.styled-modal {
  width: 90%;
  max-width: 400px;
  padding: 20px;
  border-radius: 8px;
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  animation: gradient 4s ease infinite;
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
}

.styled-textarea {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #1f5bfe, #741efe, #6c11ff);
  animation: gradient 4s ease infinite;
}

.styled-button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #fb0eff;
  color: white;
  transition: background 0.3s ease;
  margin: 5px;
}

.styled-button:hover {
  background: #e62ee6;
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

/* Анимация списка */
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

/* Анимация появления */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

/* Анимация fade */
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
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
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
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
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
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
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
