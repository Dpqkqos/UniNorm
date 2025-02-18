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
                  {{ user.daysOnPlatform }} дня на платформе
                </div>
                <div class="stat-item">
                  <span class="icon">✦</span>
                  Ваш запрос: {{ user.request }}
                  <button @click="showRequestModal = true" class="request-button">Изменить</button>
                </div>
              </div>
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
            <button @click="showModal = true" class="add-button">+ Добавить</button>
          </div>

          <div class="emotions-table">
            <div class="table-header">
              <div class="day-col">День</div>
              <div class="emotion-col">Эмоциональное состояние</div>
            </div>

            <transition-group name="list" tag="div">
              <div 
                v-for="(emotion, index) in reversedEmotions" 
                :key="emotion.day" 
                class="emotion-row"
              >
                <div class="day-col">{{ totalEmotions - index }}</div>
                <div class="emotion-col">{{ emotion.state }}</div>
              </div>
            </transition-group>
          </div>
        </div>
      </transition>

      <!-- Модальное окно эмоций -->
      <transition name="fade">
        <div 
          v-if="showModal" 
          class="modal-overlay"
          @click.self="showModal = false"
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
              <button @click="showModal = false" class="cancel-btn">Отмена</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Форма регистрации -->
      <transition name="fade">
        <div 
          v-if="showRegistrationForm" 
          class="modal-overlay"
        >
          <div class="modal-content">
            <h3>Заполните ваши данные</h3>
            <div class="input-group">
              <label>Имя:</label>
              <input v-model="registrationForm.firstName" type="text" required>
            </div>
            <div class="input-group">
              <label>Фамилия:</label>
              <input v-model="registrationForm.lastName" type="text" required>
            </div>
            <div class="input-group">
              <label>Дата рождения:</label>
              <input v-model="registrationForm.birthDate" type="date" required>
            </div>
            <div class="input-group">
              <label>Время рождения:</label>
              <input v-model="registrationForm.birthTime" type="time" required>
            </div>
            <div class="modal-actions">
              <button @click="completeRegistration" class="save-btn">Сохранить</button>
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
      showRegistrationForm: false,
      newEmotion: '',
      isKeyboardOpen: false,
      requests: [
        'Любовь',
        'Карьера',
        'Здоровье',
        'Финансы',
        'Саморазвитие',
        'Отношения'
      ],
      registrationForm: {
        firstName: '',
        lastName: '',
        birthDate: '',
        birthTime: ''
      },
      user: {
        id: null,
        fullName: 'Гость',
        avatar: '',
        daysOnPlatform: 1,
        request: 'любовь',
        forecast: '',
        emotions: [],
        birthDate: null,
        birthTime: null,
        registrationDate: null
      }
    }
  },
  computed: {
    reversedEmotions() {
      return [...this.user.emotions].reverse()
    },
    totalEmotions() {
      return this.user.emotions.length
    }
  },
  mounted() {
    this.initializeApp()
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('orientationchange', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('orientationchange', this.handleResize)
  },
  methods: {
    async initializeApp() {
      try {
        await this.initTelegramUser()
        this.loadUserData()
        this.checkRegistration()
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

    generateUserId() {
      return 'user_' + Math.random().toString(36).substr(2, 9)
    },

    checkRegistration() {
      if (!localStorage.getItem(this.user.id)) {
        this.showRegistrationForm = true
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
        }
        this.saveUserData()
        this.showRegistrationForm = false
      }
    },

    handleResize() {
      if (window.visualViewport) {
        document.documentElement.style.height = `${window.visualViewport.height}px`
        window.scrollTo(0, 0)
      }
    },

    generateAvatar(name) {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#B566FF'
      ctx.beginPath()
      ctx.arc(50, 50, 50, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.font = '40px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText((name?.[0] || 'U').toUpperCase(), 50, 50)
      return canvas.toDataURL()
    },

    setupFallbackUser() {
      this.user = {
        ...this.user,
        fullName: 'Тестовый Пользователь',
        avatar: this.generateAvatar('Т')
      }
    },

    loadUserData() {
      const savedData = localStorage.getItem(this.user.id)
      if (savedData) {
        try {
          this.user = JSON.parse(savedData)
          this.updatePlatformDays()
        } catch (e) {
          console.error('Ошибка загрузки данных:', e)
        }
      }
    },

    updatePlatformDays() {
      if (!this.user.registrationDate) return
      const diff = Date.now() - new Date(this.user.registrationDate).getTime()
      this.user.daysOnPlatform = Math.floor(diff / (1000 * 3600 * 24)) + 1
      this.saveUserData()
    },

    addEmotion() {
      if (this.newEmotion.trim()) {
        this.user.emotions.push({
          day: this.user.emotions.length + 1,
          state: this.newEmotion,
          date: new Date().toISOString()
        })
        this.saveUserData()
        this.showModal = false
        this.newEmotion = ''
      }
    },

    selectRequest(request) {
      this.user.request = request.toLowerCase()
      this.saveUserData()
      this.showRequestModal = false
    },

    validateRegistrationForm() {
      return (
        this.registrationForm.firstName.trim() &&
        this.registrationForm.lastName.trim() &&
        this.registrationForm.birthDate
      )
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
/* Базовые стили */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: linear-gradient(45deg, #ff0e6b, #ff05f7, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 10s ease infinite;
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
  min-height: 100vh;
  -webkit-text-size-adjust: 100%;
}

@keyframes gradient {
  0% {
    background-position: 50% 0%;
  }
  50% {
    background-position: 50% 100%;
  }
  100% {
    background-position: 50% 0%;
  }
}

.app-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
  margin-bottom: 2rem;
}

.main-title {
  color: #fff;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.accent {
  color: #ffb700;
  margin-left: 0.5rem;
}

.profile-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.2);
}

.user-info {
  flex-grow: 1;
}

.user-name {
  color: white;
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  word-break: break-word;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.stat-item {
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.icon {
  color: #FFD700;
}

.request-button {
  background: linear-gradient(135deg, #e567e8, #d111cb);
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  margin-left: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  font-size: 14px;
}

.request-button:hover {
  transform: scale(1.05);
}

/* Прогноз */
.forecast-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #fff;
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.forecast-card {
  background: rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  backdrop-filter: blur(8px);
}

.forecast-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.forecast-icon {
  font-size: 1.8rem;
}

/* Эмоции */
.emotions-section {
  margin-top: 2rem;
}

.emotions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-button {
  background: linear-gradient(135deg, #e567e8, #d111cb);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-button:hover {
  transform: scale(1.05);
}

.emotions-table {
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
}

.table-header {
  display: flex;
  padding: 12px;
  background: rgba(255,255,255,0.15);
  border-bottom: 1px solid rgba(255,255,255,0.2);
  font-weight: 500;
  color: #fff;
}

.emotion-row {
  display: flex;
  padding: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: #fff;
}

.day-col {
  width: 20%;
  text-align: center;
  font-weight: 500;
}

.emotion-col {
  width: 80%;
  padding-left: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  z-index: 1000;
}

.modal-content {
  background: rgba(255,255,255,0.95);
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  color: #6c11ff;
}

.requests-list {
  display: grid;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.request-item {
  background: rgba(108, 17, 255, 0.1);
  border: 2px solid #6c11ff;
  border-radius: 8px;
  padding: 0.8rem;
  color: #6c11ff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.request-item:hover {
  background: #6c11ff;
  color: white;
}

textarea {
  width: 100%;
  height: 120px;
  padding: 0.8rem;
  border: 2px solid #eee;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  resize: none;
  font-family: inherit;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.save-btn {
  background: #6c11ff;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:hover {
  opacity: 0.9;
}

.cancel-btn {
  background: none;
  border: 2px solid #eee;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

/* Форма регистрации */
.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-family: inherit;
  font-size: 16px;
  min-height: 48px;
  background: white;
}

/* Адаптивность */
@media (max-width: 480px) {
  .app-container {
    padding: 15px;
  }

  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
  }

  .user-avatar {
    margin-bottom: 1rem;
    width: 70px;
    height: 70px;
  }

  .emotions-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .save-btn, .cancel-btn {
    width: 100%;
  }

  .request-button {
    margin-left: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-size: 13px;
  }

  .input-group input {
    font-size: 16px;
    padding: 10px;
  }
}
</style>