<script setup>
import { ref, computed, watch } from 'vue';
import { DatePicker } from 'v-calendar';
// Asegúrate de que esta importación de estilos esté correcta en tu proyecto
import 'v-calendar/style.css';


const props = defineProps({
    selectedDate: {
        type: Date,
        default: new Date()
    },
    attributes: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:selectedDate']);
const localSelectedDate = computed({
    // GET: Devuelve el valor actual de la prop
    get() {
        return props.selectedDate;
    },
    // SET: Emite el evento de actualización al padre
    set(value) {
        emit('update:selectedDate', value);
    }
});


watch(() => props.attributes, (newValue) => {
    console.log({
        newValue
    });

})
// -------------------
// 1. ESTADO REACTIVO
// -------------------
const viewMode = ref('monthly');
// -------------------
// 2. DEFINICIÓN DE ATRIBUTOS (Días marcados y etiquetas)
// -------------------
</script>
<template>
    <div class="calendar-container">
        <!-- El DatePicker con la etiqueta, expandido e inline. -->
        <DatePicker v-model="localSelectedDate" expanded view="weekly" :attributes="attributes" show-weeknumbers>
            <!-- Slot para el Label (etiqueta) encima del componente -->
            <template #header>
                <div class="p-4 text-2xl font-bold text-gray-800">

                </div>
            </template>
        </DatePicker>
    </div>
</template>

<style scoped>
/* Estilos específicos para asegurar el ancho completo y el estilo del label.
  Nota: Para modificar los estilos internos de V-Calendar, a veces es necesario 
  usar selectores menos específicos o anular los estilos de la librería 
  si no se usan clases de utilidad como Tailwind. 
*/
.calendar-container {
    /* Asegura que el contenedor del DatePicker tenga un ancho */
    width: 100%;
    max-width: 800px;
    /* Ancho máximo para mejor visualización */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
    background-color: #fff;
}

/* Estilo del texto del label que se superpone al día 
  (corresponde a la clase 'v-calendar-label-content-fiesta' definida arriba)
*/
:global(.v-calendar-label-content-fiesta) {
    /* !important puede ser necesario para anular los estilos por defecto de la librería.
      Si usas V-Calendar v3 o superior, la forma de estilizar los atributos 
      puede haber cambiado y ser más sencillo a través de las propiedades del objeto.
    */
    font-size: 0.7rem !important;
    font-weight: bold !important;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
}
</style>