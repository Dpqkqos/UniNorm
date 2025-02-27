import { createApp } from 'vue';
<<<<<<< HEAD
import App from './App.vue'; 

=======
import App from './App.vue';

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Автоматическое определение темы
document.body.classList.add(tg.colorScheme === 'dark' ? 'dark-theme' : 'light-theme');

// Слушатель изменений темы
tg.onEvent('themeChanged', () => {
  document.body.classList.remove('dark-theme', 'light-theme');
  document.body.classList.add(tg.colorScheme === 'dark' ? 'dark-theme' : 'light-theme');
});

>>>>>>> 325ae03bb0fa6fcc0ab7836af719078adcc57cec
createApp(App).mount('#app');