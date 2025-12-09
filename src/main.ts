import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupCalendar, Calendar, DatePicker } from 'v-calendar'
import 'sweetalert2/src/sweetalert2.scss'

const app = createApp(App)

app.use(setupCalendar, {})

// Use the components
app.component('VCalendar', Calendar)
app.component('VDatePicker', DatePicker)

app.use(router)

app.mount('#app')
