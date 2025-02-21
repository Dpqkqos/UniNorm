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
              <button @click="showRequestModal = true" class="change-request-button">
                Изменить запрос
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Модальное окно выбора запроса -->
      <transition name="fade">
        <div 
          v-if="showRequestModal" 
          class="modal-overlay"
          @click.self="showRequestModal = false"
        >
          <div class="modal-content">
            <h3>Выберите ваш запрос</h3>
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
            <div class="modal-actions">
              <button @click="showRequestModal = false" class="cancel-btn">Закрыть</button>
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
            <h2 class="section-title">Ведение эмоционального состояния<span class="accent">✦</span></h2>
            <button @click="showAddModal = true" class="add-button">+ Добавить</button>
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
                  <button @click.stop="openEditModal(index)" class="edit-btn">✎</button>
                  <button @click.stop="deleteEmotion(index)" class="delete-btn">×</button>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </transition>

      <!-- Модальное окно добавления эмоции -->
      <transition name="fade">
        <div 
          v-if="showAddModal" 
          class="modal-overlay"
          @click.self="showAddModal = false"
        >
          <div class="modal-content">
            <h3>Опишите ваше состояние</h3>
            <textarea 
              v-model="newEmotion" 
              placeholder="Сегодня я чувствую..."
              @focus="handleTextareaFocus"
              @blur="handleTextareaBlur"
            ></textarea>
            <div class="modal-actions" :class="{ 'keyboard-open': isKeyboardOpen }">
              <button @click="addEmotion" class="save-btn">Сохранить</button>
              <button @click="showAddModal = false" class="cancel-btn">Отмена</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Модальное окно редактирования эмоции -->
      <transition name="fade">
        <div 
          v-if="showEditModal" 
          class="modal-overlay"
          @click.self="showEditModal = false"
        >
          <div class="modal-content">
            <h3>Редактировать состояние</h3>
            <textarea 
              v-model="editingEmotion.state" 
              placeholder="Сегодня я чувствую..."
              @focus="handleTextareaFocus"
              @blur="handleTextareaBlur"
            ></textarea>
            <div class="modal-actions" :class="{ 'keyboard-open': isKeyboardOpen }">
              <button @click="saveEditedEmotion" class="save-btn">Сохранить</button>
              <button @click="showEditModal = false" class="cancel-btn">Отмена</button>
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
      showAddModal: false,
      showEditModal: false,
      showRequestModal: false,
      newEmotion: '',
      editingEmotion: null,
      isKeyboardOpen: false,
      requests: [
        'Любовь',
        'Карьера',
        'Здоровье',
        'Финансы',
        'Саморазвитие',
        'Отношения'
      ],
      user: {
        id: null,
        fullName: 'Гость',
        avatar: '',
        daysOnPlatform: 1,
        request: 'любовь',
        forecast: '',
        emotions: [],
      }
    }
  },
  computed: {
    reversedEmotions() {
      return [...this.user.emotions].reverse()
    },
    totalEmotions() {
      return this.user.emotions.length
    },
    daysText() {
      const days = this.user.daysOnPlatform
      const last = days % 10
      if (days > 10 && days < 20) return 'дней'
      if (last === 1) return 'день'
      if (last > 1 && last < 5) return 'дня'
      return 'дней'
    }
  },
  mounted() {
    this.initializeApp()
  },
  methods: {
    async initializeApp() {
      try {
        await this.initTelegramUser()
        this.loadUserData()
      } catch (error) {
        console.error('Ошибка инициализации:', error)
        this.setupFallbackUser()
      } finally {
        this.loading = false
      }
    },

    initTelegramUser() {
      return new Promise((resolve, reject) => {
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp
          const user = tg.initDataUnsafe?.user
          
          if (user) {
            this.user.id = user.id || this.generateUserId()
            this.user.fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь'
            this.user.avatar = user.photo_url || this.generateAvatar(user.first_name)
            tg.expand()
            tg.enableClosingConfirmation()
            resolve()
          } else {
            reject('Данные пользователя Telegram не доступны')
          }
        } else {
          this.user.id = this.generateUserId()
          resolve()
        }
      })
    },

    deleteEmotion(index) {
      this.user.emotions.splice(this.user.emotions.length - 1 - index, 1)
      this.saveUserData()
    },

    openEditModal(index) {
      this.editingEmotion = { ...this.user.emotions[this.user.emotions.length - 1 - index], index }
      this.showEditModal = true
    },

    saveEditedEmotion() {
      this.user.emotions[this.editingEmotion.index].state = this.editingEmotion.state
      this.saveUserData()
      this.showEditModal = false
    },

    addEmotion() {
      if (this.newEmotion.trim()) {
        this.user.emotions.push({
          day: this.user.emotions.length + 1,
          state: this.newEmotion,
          date: new Date().toISOString()
        })
        this.saveUserData()
        this.showAddModal = false
        this.newEmotion = ''
      }
    },

    selectRequest(request) {
      this.user.request = request.toLowerCase()
      this.saveUserData()
      this.showRequestModal = false
    },

    saveUserData() {
      localStorage.setItem(this.user.id, JSON.stringify(this.user))
    },

    handleTextareaFocus() {
      this.isKeyboardOpen = true
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand()
      }
    },

    handleTextareaBlur() {
      this.isKeyboardOpen = false
    }
  }
}
</script>

<style>


@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: 'Montserrat', sans-serif;
  line-height: 1.6;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  background: #fff;
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  overflow: hidden;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Основной контейнер */
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
  scroll-behavior: smooth;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(45deg, #2caadb, #872cdb, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-content h3 {
  color: #fff;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.modal-content textarea {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  margin-bottom: 15px;
}

.modal-content textarea::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
}

.save-btn, .cancel-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.save-btn {
  background: #ff3bff;
  color: white;
}

.save-btn:hover {
  background: #e62ee6;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Анимации */
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

/* Профиль */
.profile-section {
  margin-bottom: 1rem;
}

.accent {
  color: #ffcc26;
}

.main-title {
  text-align: center;
  background: linear-gradient(45deg, #2caadb, #872cdb, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  background-clip: text;
  color: transparent;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.profile-card {
  text-align: center;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: linear-gradient(45deg, #2caadb, #872cdb, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
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

/* Кнопка "Изменить запрос" */
.change-request-button {
  width: 100%;
  padding: 12px 24px;
  background: #ff0e6b;
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
  margin-top: 15px;
}

.change-request-button:hover {
  background: #e62ee6;
}

/* Прогноз */
.forecast-section {
  margin-bottom: 1rem;
}

.section-title {
  background: linear-gradient(45deg, #2caadb, #872cdb, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  background-clip: text;
  color: transparent;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.forecast-card {
  background: linear-gradient(45deg, #2caadb, #872cdb, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  padding: 15px;
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

/* Эмоции */
.emotions-section {
  margin-bottom: 1rem;
}

.emotions-header {
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button {
  padding: 8px 12px;
  background: #ff0e6b;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-button:hover {
  background: #e62ee6;
}

.emotions-table {
  text-align: center;
  background: linear-gradient(45deg, #2caadb, #872cdb, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  border-radius: 10px;
  padding: 10px;
  margin: 15px 0;
  font-size: 0.9rem; /* Уменьшенный шрифт */
}

.table-header, .emotion-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0; /* Уменьшенные отступы */
  color: #fff;
}

.table-header {
  font-weight: bold;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.day-col {
  flex: 1;
}

.emotion-col {
  flex: 3;
}

.action-col {
  width: 30px; /* Уменьшенная ширина */
  text-align: right;
}

.edit-btn {
  background-color: transparent;
  border: none;
  color: #ffcc26;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 8px;
  transition: color 0.3s ease;
}

.edit-btn:hover {
  color: #ff3bff;
}


.delete-btn {
  background: none;
  border: none;
  color: #ff3b3b;
  font-size: 1.2rem; /* Уменьшенный размер иконки */
  cursor: pointer;
  padding: 0 4px; /* Уменьшенные отступы */
}

/* Форма регистрации */
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

/* Кнопки выбора запроса */
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

/* Адаптация для мобильных устройств */
@media (max-width: 600px) {
  html, body {
    position: fixed;
    width: 100%;
    height: 100%;
  }

  .app-container {
    padding: 15px;
    border-radius: 0;
    height: 100% !important;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .emotions-table {
    margin: 10px 0;
    font-size: 0.8rem; /* Ещё меньше шрифт на мобильных */
  }

  .table-header, .emotion-row {
    padding: 4px 0; /* Ещё меньше отступы на мобильных */
  }
}
</style>
