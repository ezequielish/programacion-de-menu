<script setup>
import { ref, watch, onMounted } from 'vue';
import DatePicker from '@/components/DatePicker.vue';
function formatLocalDate(date) {
  if (!date) return
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const selectedDate = ref(new Date());
const programmedMenus = localStorage.getItem('menus');
const customAttributes = ref([]);
const dishes = ref([]);
const weekNumber = ref(0);
// const customAttributes = computed(() => [
//   // --- Atributo 1: Fiestas y Etiquetas (Highlight con texto) ---
//   // {
//   //     key: 'fiesta-navidad', // Identificador único
//   //     // Define el estilo de resaltado (fondo de color)
//   //     highlight: {
//   //         color: 'green',
//   //         fillMode: 'solid',
//   //         // Propiedad 'content': Aquí es donde se define el texto que aparece SOBRE el día.
//   //         content: 'white', // Esto establece el color del texto de la etiqueta
//   //         class: 'v-calendar-label-content-fiesta' // Clase CSS para estilizar el texto
//   //     },
//   //     dates: [
//   //         new Date(2025, 11, 25), // Navidad
//   //         new Date(2025, 11, 31), // Nochevieja
//   //     ],
//   //     // Puedes añadir una etiqueta popover (al pasar el ratón) si lo deseas
//   //     popover: {
//   //         label: '¡Día Festivo!',
//   //     }
//   // },

//   // --- Atributo 2: Recordatorio con Punto (Dot) ---
//   {
//     key: 'Desayuno',
//     // Usamos el punto para indicar un evento
//     dot: {
//       color: 'green',
//       // style: {
//       //   backgroundColor: 'blue',
//       //   width: '8px',
//       //   height: '8px',
//       // }
//     },
//     dates: new Date(2025, 11, 15),
//     popover: {
//       label: 'Pan con Jamón y Queso',
//       visibility: 'click'
//     }
//   },
//   {
//     key: 'Almuerzo',
//     // Usamos el punto para indicar un evento
//     dot: 'red',
//     dates: new Date(2025, 11, 15),
//     popover: {
//       label: 'Pollo Pebre con Papas al Horno',
//       visibility: 'click'
//     }
//   },
//   {
//     key: 'Cena',
//     // Usamos el punto para indicar un evento
//     dot: 'blue',
//     dates: new Date(2025, 11, 15),
//     popover: {
//       label: 'Arepa de Pollo Guisado y Queso Llanero',
//       visibility: 'click'
//     }
//   },
//   // --- Atributo 3: Tarea Importante (Bar) ---
//   // {
//   //     key: 'tarea',
//   //     // Usamos la barra (bar) para indicar un rango o día clave
//   //     bar: 'red',
//   //     dates: new Date(2025, 11, 10),
//   //     popover: {
//   //         label: 'Fecha Límite de Entrega',
//   //         visibility: 'click'
//   //     }
//   // },
// ]);
function getISOWeekNumber(dateString) {
  // 1. Convertir la cadena de texto a un objeto Date.
  // Usamos new Date(dateString + 'T00:00:00Z') para forzar la interpretación como UTC,
  // evitando problemas de zona horaria local que podrían alterar el día.
  var d = new Date(dateString + 'T00:00:00Z');

  // 2. Comprobar si la fecha es válida.
  if (isNaN(d.getTime())) {
    return "Fecha inválida";
  }

  // 3. Ajustar la fecha al jueves de esa misma semana (Estándar ISO 8601).
  // El 4 representa el jueves (Dom=0, Lun=1, Mar=2, Mié=3, Jue=4, Vie=5, Sáb=6).
  // d.getUTCDay() || 7 devuelve 7 si es domingo (0), para el cálculo de offset.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

  // 4. Obtener el inicio del año (1 de enero de ese año).
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  // 5. Calcular la diferencia en días y luego en semanas.
  // 86400000 es el número de milisegundos en un día.
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  // 6. Retornar el número de semana.
  return weekNo;
}
const dateObject = new Date(selectedDate.value);
const year = dateObject.getFullYear();

// 2. Obtener el mes (getMonth() es base 0, por eso se suma 1)
// Se usa .toString().padStart(2, '0') para asegurar '01', '02', etc.
const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');

// 3. Obtener el día
const day = dateObject.getDate().toString().padStart(2, '0');
let _date = typeof selectedDate.value == 'object' ? `${year}-${month}-${day}` : selectedDate.value;

weekNumber.value = getISOWeekNumber(_date);

const menuTypeColor = {
  'Desayuno': 'green',
  'Almuerzo': 'yellow',
  'Cena': 'red'
}

onMounted(() => {
  if (programmedMenus) {
    dishes.value = JSON.parse(programmedMenus);

    const newDish = dishes.value.map((menu, indx) => (

      {

        key: `${menu.dish.dish_type}-${(indx + 1)}`,
        // Usamos el punto para indicar un evento
        dot: {
          color: menuTypeColor[menu.dish.dish_type],
          // style: {
          //   backgroundColor: 'blue',
          //   width: '8px',
          //   height: '8px',
          // }
        },
        dates: new Date(parseInt(menu.date.split('-')[0]), (parseInt(menu.date.split('-')[1]) - 1), parseInt(menu.date.split('-')[2])),
        popover: {
          label: menu.dish.name,
          visibility: 'hover'

        }
      }
    ));

    customAttributes.value = newDish;

  }
});

watch(selectedDate, (newValue, oldValue) => {

  const dateObject = new Date(newValue);
  const year = dateObject.getFullYear();

  // 2. Obtener el mes (getMonth() es base 0, por eso se suma 1)
  // Se usa .toString().padStart(2, '0') para asegurar '01', '02', etc.
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');

  // 3. Obtener el día
  const day = dateObject.getDate().toString().padStart(2, '0');
  let _date = typeof newValue == 'object' ? `${year}-${month}-${day}` : newValue;

  weekNumber.value = getISOWeekNumber(_date);
});

const emoticons = [
  '🍗',
  '🥩',
  '🐟',
  '🐷',
  '🍳'
];
</script>

<template>
  <main>
    <div class="logo">
      <img src="/logo.png" width="50px" />
    </div>
    <div>
      <!-- <p class="title">Semana {{ weekNumber }}</p> -->
      <DatePicker v-model:selected-date="selectedDate" :attributes="customAttributes" />
      <div class="wrapper-card">
        <div v-for="dish in dishes">
          <div v-if="dish.date === formatLocalDate(selectedDate)" class="dish">
            <p class="title">🍽️ {{ dish.dish.dish_type }}</p>
            <p class="type">{{ emoticons[dish.dish.type - 1] }}</p>
            <div class="card">
              <img class="dish-img" :src="dish.dish.image" />
              <div class="categories">

              </div>
              <div>
                <p class="name"> {{ dish.dish.name }}</p>
                <!-- <p class="description">{{ dish.dish.description }}</p> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  width: 100%;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}

.logo {
  display: flex;
  justify-content: center;
}

.wrapper-card {
  display: flex;
  flex-direction: column;
  /* gap: 1.5rem; */
}

.card {
  margin-top: .5rem;
  display: flex;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card img {
  /* width: 135px; */
  width: 100%;
  height: 275px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  object-fit: cover;
}

.name {
  position: absolute;
  bottom: 8px;
  left: 10px;
  background: #ffffff87;
  padding: .5rem;
  width: 94%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  border-radius: 7px;
}

.type {
  position: absolute;
  top: 85px;
  z-index: 1;
  left: 21px;
  background: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
}

.dish {
  position: relative;
}
</style>