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
  -webkit-tap-highlight-color: transparent;
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
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
  background: rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.25);
}

.user-info {
  flex-grow: 1;
}

.user-name {
  color: white;
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  word-break: break-word;
  line-height: 1.3;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.stat-item {
  color: white;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
}

.icon {
  color: #FFD700;
  flex-shrink: 0;
}

.request-button {
  background: linear-gradient(135deg, #e567e8, #d111cb);
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 12px;
  margin-left: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.request-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(229, 103, 232, 0.3);
}

/* Прогноз */
.forecast-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #fff;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 2px rgba(0,0,0,0.1);
}

.forecast-card {
  background: rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.forecast-content {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.forecast-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

/* Эмоции */
.emotions-section {
  margin-top: 2rem;
}

.emotions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.add-button {
  background: linear-gradient(135deg, #e567e8, #d111cb);
  color: white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.add-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(229, 103, 232, 0.3);
}

.emotions-table {
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.table-header {
  display: flex;
  padding: 14px;
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
  transition: background 0.2s;
}

.emotion-row:hover {
  background: rgba(255,255,255,0.05);
}

.day-col {
  width: 20%;
  text-align: center;
  font-weight: 500;
  padding: 0 8px;
}

.emotion-col {
  width: 80%;
  padding-left: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
}

.modal-content {
  background: rgba(255,255,255,0.98);
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  color: #6c11ff;
  font-size: 1.4rem;
}

.requests-list {
  display: grid;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.request-item {
  background: rgba(108, 17, 255, 0.08);
  border: 2px solid #6c11ff;
  border-radius: 12px;
  padding: 0.9rem;
  color: #6c11ff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-weight: 500;
}

.request-item:hover {
  background: #6c11ff;
  color: white;
  transform: translateY(-2px);
}

textarea {
  width: 100%;
  height: 120px;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  resize: none;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.5;
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
  padding: 0.8rem 1.6rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.save-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.cancel-btn {
  background: none;
  border: 2px solid #e0e0e0;
  padding: 0.8rem 1.6rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.cancel-btn:hover {
  background: #f8f9fa;
  color: #333;
}

/* Форма регистрации */
.input-group {
  margin-bottom: 1.2rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.6rem;
  color: #444;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 16px;
  min-height: 50px;
  background: white;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: #6c11ff;
  outline: none;
}

/* Адаптивность */
@media (max-width: 480px) {
  .app-container {
    padding: 15px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.2rem;
    gap: 1.2rem;
  }

  .user-avatar {
    margin-bottom: 1rem;
    width: 72px;
    height: 72px;
  }

  .user-name {
    font-size: 1.3rem;
  }

  .request-button {
    margin-left: 0;
    margin-top: 0.5rem;
    width: 100%;
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
    gap: 0.8rem;
  }

  .save-btn, .cancel-btn {
    width: 100%;
    text-align: center;
  }

  .input-group input {
    font-size: 16px;
    padding: 12px;
  }
}

@supports not (backdrop-filter: blur(12px)) {
  .profile-card,
  .forecast-card,
  .emotions-table {
    background: rgba(255,255,255,0.95);
  }
  
  .app-container {
    background: rgba(255,255,255,0.98);
  }
}
</style>
почини код у меня в телеграмме карточка пользователя белая полностью на телефоне это мини приложение в боте
используй
https://telegram.org/js/telegram-web-app.js