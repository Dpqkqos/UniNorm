import { createApp } from 'vue';
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

createApp(App).mount('#app');