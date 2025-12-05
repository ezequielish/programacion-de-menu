<script setup>
import { ref, watch, onMounted } from 'vue';
import DatePicker from '@/components/DatePicker.vue';
import { jsPDF } from 'jspdf';

import 'jspdf-autotable';
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

function filterAndGtroup(dataArray, weekToFilter) {

  const dataWithWeekAndDateObj = dataArray.map(item => {
    // Usamos UTC para la consistencia del cálculo de la semana
    const dateObj = new Date(item.date + 'T00:00:00Z');
    return {
      ...item,
      dateObj: dateObj, // Se agrega el objeto Date para ordenar
    };
  });


  // 1. Filtrar por la semana deseada
  const filteredByWeek = dataWithWeekAndDateObj.filter(item => item.week_day === weekToFilter);

  filteredByWeek.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  // 2. Agrupar los resultados por el campo 'date' original
  const groupedByDate = filteredByWeek.reduce((acc, item) => {
    const dateKey = item.date;

    // Si la clave de fecha no existe en el acumulador, la creamos como un array
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    // Agregamos el objeto al array de su fecha correspondiente
    acc[dateKey].push(item);

    return acc;
  }, {}); // El acumulador inicial es un objeto vacío

  return groupedByDate;
}

/**
 * Transforma el objeto de menú agrupado por fecha en un array de filas
 * apto para un PDF de menú semanal (Formato "Pivote").
 * @param {Object} groupedMenuData - El objeto JSON agrupado por fechas.
 * @returns {Array<Object>} Array donde cada objeto es una fila (tipo de comida).
 */
function transformToWeeklyMenuFormat(groupedMenuData) {
  const mealTypes = ['Desayuno', 'Almuerzo', 'Cena'];
  const days = Object.keys(groupedMenuData); // Obtiene las fechas: ['2025-12-01', '2025-12-02', ...]

  // Inicializa el resultado con las filas para cada tipo de comida
  const weeklyMenuData = mealTypes.map(type => ({
    'Tipo de Comida': type
  }));

  // Rellena la tabla con los nombres de los platos
  for (const date of days) {
    const mealsForDay = groupedMenuData[date];

    for (const meal of mealsForDay) {
      const dishType = meal.dish.dish_type;
      const dishName = meal.dish.name;

      // Encuentra la fila correspondiente al Tipo de Comida
      const row = weeklyMenuData.find(r => r['Tipo de Comida'] === dishType);

      if (row) {
        // Asigna el plato a la columna de la fecha
        row[date] = dishName;
      }
    }
  }

  // Asegura que todas las celdas sin plato tengan un valor (ej. 'N/A')
  for (const row of weeklyMenuData) {
    for (const date of days) {
      if (!row[date]) {
        row[date] = 'N/A'; // O deja vacío: ''
      }
    }
  }

  return weeklyMenuData;
}

const generatePdf = () => {
  if (programmedMenus) {
    const programmedMenus = localStorage.getItem('menus'); // Asegúrate de obtenerlo aquí también

    if (programmedMenus) {
      const _dishes = JSON.parse(programmedMenus);

      if (!_dishes || _dishes.length === 0) {
        alert("No hay datos para generar el PDF.");
        return;
      }


      const filteredDates = filterAndGtroup(_dishes, weekNumber.value);
      const pivotedData = transformToWeeklyMenuFormat(filteredDates);

      let headerDates = Object.keys(filteredDates);

      // 1. PREPARAR/Aplanar los datos para AutoTable
      // Extraemos solo las columnas relevantes: Fecha, Tipo de Comida y Nombre del Plato.
      const pdfData = _dishes.map(menu => ({
        Fecha: menu.date,
        'Tipo de Comida': menu.dish.dish_type,
        'Plato': menu.dish.name,
        // Puedes añadir más campos aquí, por ejemplo:
        // 'Tipo de Proteína': emoticons[menu.dish.type - 1] 
      }));

      // 2. Extraer Encabezados y Filas
      const datesWithDay = headerDates.map(dateString => {
        // 2. Crear un objeto Date
        // Se recomienda añadir 'T00:00:00' para asegurar que la hora sea medianoche,
        // evitando problemas de zona horaria que podrían cambiar el día.
        const _date = new Date(dateString + 'T00:00:00');

        // 3. Opciones para obtener el nombre del día
        // weekday: 'long' pide el nombre completo del día (ej: "lunes", "martes")
        const opciones = { weekday: 'long' };

        // 4. Obtener el nombre del día en español (es-ES)
        const nameDay = _date.toLocaleDateString('es-ES', opciones);

        // 5. Formatear la primera letra en mayúscula para la presentación
        const capitalizedDay = nameDay.charAt(0).toUpperCase() + nameDay.slice(1);

        // 6. Devolver la fecha original con el nombre del día
        return `${dateString} (${capitalizedDay})`;
      });

      const headers = headerDates;

      const titleHeader = [
        {
          content: `SEMANA ${weekNumber.value}`, // El título que quieres
          colSpan: headers.length, // ¡CLAVE! Hace que el título ocupe todas las columnas
          styles: {
            // fillColor: [100, 100, 100], // Color de fondo gris para el título
            textColor: 0,             // Texto blanco
            fontStyle: 'bold',
            halign: 'center',           // Centra el título
            fontSize: 10
          }
        }
      ];
      // Mapear los objetos planos a arrays de valores (AutoTable lo necesita así)
      // const data = pdfData.map(obj => headers.map(header => obj[header]));
      const data = pivotedData.map(obj => headerDates.map(header => obj[header]));
      const { jsPDF } = window.jspdf;

      // 3. Inicializar jsPDF
      const doc = new jsPDF({
        orientation: 'l', // 'l' para landscape (horizontal), 'p' para portrait (vertical)
        unit: 'mm',
        format: 'a4'
      });

      // 4. Agregar título
      // doc.text("Reporte de Menús Programados", 14, 10);
      // 5. Configurar la tabla
      doc.autoTable({
        head: [titleHeader, datesWithDay],
        body: data,
        startY: 15,
        theme: 'striped',
        styles: { halign: 'left', fontSize: 9 },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0], halign: 'center',
          lineWidth: 0.1, // Un valor pequeño (en 'mm' o la unidad que uses)
          lineColor: [0, 0, 0] // Opcional: Asegurar que la línea es negra
        },
        bodyStyles: {
          lineWidth: 0.1,  // Grosor de la línea
          lineColor: [0, 0, 0] // Color negro para la línea
        },
      });

      // 6. Guardar el PDF
      doc.save(`menus_semana_${weekNumber.value}.pdf`);
    } else {
      alert("No hay menús programados en localStorage.");
    }
  }
}

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
      <button @click="generatePdf">Generar PDF</button>
      <DatePicker v-model:selected-date="selectedDate" :attributes="customAttributes" />
      <div class="wrapper-card">
        <div v-for="dish in dishes" class="wrapper-dish">
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

@media screen and (min-width: 768px) {
  .wrapper-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .wrapper-card .wrapper-dish:first-child {
    grid-column: 1;
  }
}
</style>