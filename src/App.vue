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
            // Устанавливаем светлую тему
            tg.setHeaderColor('#FFFFFF') // Белый цвет фона
            tg.setBackgroundColor('#FFFFFF') // Белый цвет фона
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

html, body {
  height: 100%;
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  background: linear-gradient(45deg, #ff0e6b, #ff05f7, #6c11ff);
  background-size: 400% 400%;
  animation: gradient 10s ease infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Убираем скролл при открытии модального окна */
}

@keyframes gradient {
  0% { background-position: 50% 0%; }
  50% { background-position: 50% 100%; }
  100% { background-position: 50% 0%; }
}

.app-container {
  max-width: 600px;
  width: 100%;
  margin: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  color: white;
}

/* Профиль */
.profile-section {
  text-align: center;
  margin-bottom: 20px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  text-align: center;
}

.user-name {
  font-size: 1.4rem;
  font-weight: bold;
}

/* Кнопка запроса */
.request-button {
  margin-left: 10px;
  background: none;
  border: 1px solid white;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.request-button:hover {
  background: white;
  color: black;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  color: black;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.save-btn, .cancel-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-btn {
  background: #6c11ff;
  color: white;
}

.cancel-btn {
  background: lightgray;
}

.save-btn:hover {
  background: #4a0db2;
}

.cancel-btn:hover {
  background: gray;
}

/* Список запросов */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.request-item {
  padding: 10px;
  background: #6c11ff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  border: none;
}

.request-item:hover {
  background: #4a0db2;
}

/* Прогноз */
.forecast-section {
  margin-top: 20px;
}

.forecast-card {
  padding: 15px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  text-align: center;
}

.forecast-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 10px;
}

/* Таблица эмоций */
.emotions-section {
  margin-top: 20px;
}

.emotions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button {
  background: #ff0e6b;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.add-button:hover {
  background: #d00b5e;
}

.emotions-table {
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.emotion-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.emotion-row:first-child {
  border-top: none;
}

/* Модальное окно эмоций */
textarea {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid lightgray;
  resize: none;
}

textarea:focus {
  outline: none;
  border-color: #6c11ff;
}

/* Анимации */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s;
}

.slide-up-enter, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-enter-active, .list-leave-active {
  transition: all 0.3s;
}

.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

</style>