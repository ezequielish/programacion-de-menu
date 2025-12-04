<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// Define las opciones de navegación
const navItems = ref([
    { name: 'Menús', icon: '📋', path: '/' },
    { name: 'Programación', icon: '📆', path: '/calendario' },

    // { name: 'Perfil', icon: '👤', path: '/profile' },
]);

// Estado reactivo para la opción activa (simulación de ruta)
// const activePath = ref('/');
const route = useRoute();
const currentUrl = ref("/")

watch(() => route.path, (newValue, oldValue) => {
    // Cuando la ruta de navegación principal cambie, cierra cualquier menú abierto.
    if (newValue != oldValue) {
        currentUrl.value = newValue

    }
});
</script>

<template>
    <nav class="bottom-nav">
        <RouterLink :to="item.path" v-for="item in navItems" :key="item.name" :href="item.path"
            :class="['nav-item', { active: item.path === currentUrl }]">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
        </RouterLink>
    </nav>
</template>

<style scoped>
/* Contenedor principal de la barra de navegación */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    /* Altura fija */
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #ffffff;
    /* Fondo blanco */
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    /* Sombra superior sutil */
    z-index: 1000;
    /* Asegura que esté por encima de otros contenidos */
}

/* Estilo para cada elemento de navegación */
.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #888;
    /* Color de ícono/texto por defecto */
    font-size: 12px;
    padding: 5px 0;
    flex-grow: 1;
    /* Ocupa el espacio uniformemente */
    transition: color 0.3s ease;
}

/* Estilo para el elemento activo */
.nav-item.active {
    color: #42b883;
    /* Color de Vue.js para el activo */
}

/* Estilo del ícono */
.nav-icon {
    font-size: 24px;
    margin-bottom: 3px;
}

/* Estilo del texto del elemento */
.nav-text {
    font-weight: 500;
}
</style>