import 'focus-visible';
import './register-service-worker';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

createApp(App)
  .use(router)
  .use(createPinia())
  .mount('#app');
