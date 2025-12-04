<script setup>
import { reactive, ref } from "vue"
import DatePicker from "@/components/DatePicker.vue";

import { toast } from "vue3-toastify";
import api from "@/api/data.json"

const categoriesIngredient = reactive([
    'Aves',
    'Carnes',
    'Pescado',
    'Jamón',
    'Huevos y Lácteos'
]);

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const dish = ref(api.dish);
const dishType = ref("0");
const date = ref(new Date());
// const selectedDate = formatLocalDate(new Date());
const categoryIngredient = ref("0");
const steps = ref([0, 0, 0]);

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

const handleChangeCategoryAndType = () => {
    const result = api.dish.filter((item) => (item.dish_type === dishType.value && categoryIngredient.value === item.type));
    if (dishType.value == '0') {
        dish.value = api.dish
        return
    } else if (categoryIngredient.value == '0' && dishType.value != '0') {

        const result = api.dish.filter((item) => (item.dish_type === dishType.value));
        dish.value = result
        return
    }

    dish.value = result

}
const handleSaveDish = (index) => {

    if (dish.value[index] == undefined) {
        toast.error('Seleccione un Plato', {
            position: toast.POSITION.TOP_CENTER,
        });
        return
    }

    const _dish = dish.value[index];

    const programmedMenus = localStorage.getItem('menus');
    const dateObject = new Date(date.value);
    const year = dateObject.getFullYear();

    // 2. Obtener el mes (getMonth() es base 0, por eso se suma 1)
    // Se usa .toString().padStart(2, '0') para asegurar '01', '02', etc.
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');

    // 3. Obtener el día
    const day = dateObject.getDate().toString().padStart(2, '0');
    let _date = typeof date.value == 'object' ? `${year}-${month}-${day}` : date.value;

    const weekNumber = getISOWeekNumber(_date);

    if (!programmedMenus) {
        const arrayJSON = JSON.stringify([{
            date: _date,
            dish: _dish,
            week_day: weekNumber
        }]);

        localStorage.setItem('menus', arrayJSON);

        toast.success(_dish.dish_type + ' Agregado a la fecha ' + _date, {
            position: toast.POSITION.TOP_CENTER,
        });

        window.scrollTo(0, 0)
    }

    if (programmedMenus) {

        const arrayJSON = JSON.parse(programmedMenus);

        arrayJSON.filter((item, indx) => {
            if (item.date == _date && item.dish.dish_type == _dish.dish_type) {
                arrayJSON.splice(indx, 1);
            }
        })

        const newDish = {
            date: _date,
            dish: _dish,
            week_day: weekNumber
        };
        arrayJSON.push(newDish);
        localStorage.setItem('menus', JSON.stringify(arrayJSON));
        toast.success(_dish.dish_type + ' Agregado a la fecha ' + _date, {
            position: toast.POSITION.TOP_CENTER,
        });
        window.scrollTo(0, 0)
    }

}
</script>

<template>
    <div class="filters">
        <div>
            <p class="f-t">Fecha de programación <span v-if="(typeof date != 'object')"> {{ date }}</span></p>
            <input type="date" placeholder="" v-model="date" />
        </div>
        <select v-model="dishType" @change="handleChangeCategoryAndType">
            <option value="0" selected>Tipos de plato</option>
            <option value="Desayuno">Desayuno</option>
            <option value="Almuerzo">Almuerzo</option>
            <option value="Cena">Cena</option>
        </select>
        <select v-model="categoryIngredient" @change="handleChangeCategoryAndType">
            <option value="0" selected>Categorias de plato</option>
            <option value="1">Aves</option>
            <option value="2">Carnes</option>
            <option value="3">Pescado</option>
            <option value="4">Jamón</option>
            <option value="5">Huevos y Lácteos</option>
        </select>
    </div>
    <div class="wrapper">
        <div v-for="(value, index) in dish" class="card">
            <span class="number">{{ index + 1 }}</span>
            <img class="dish-img" :src="value.image" />
            <div class="categories">
                <span>{{ value.dish_type }}</span>
                <span>{{ categoriesIngredient[value.type - 1] }}</span>
            </div>
            <p class="name">{{ value.name }}</p>
            <p class="description">{{ value.description }}</p>
            <button class="add-btn" @click="handleSaveDish(index)">AGREGRAR PLATO</button>
        </div>
    </div>
</template>

<style scoped>
/* .wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
} */

.card {
    position: relative;
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.add-btn {
    padding: .8rem;
    border-radius: 7px;
    border: none;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
    width: 100%;
    color: white;
    background: #4CAF50;
    margin-top: 1rem;
}

.filters {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    margin-bottom: 2rem;
}

.filters .f-t {
    margin-bottom: .5rem;
    font-weight: 700;
}

.filters select,
.filters input {
    padding: .5rem;
    border-radius: 7px;
    border: none;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
    width: 100%;
}

.card .number {
    position: absolute;
    left: 14px;
    top: 10px;
    font-size: 1.2rem;
    font-weight: bold;
    background-color: rgba(176, 176, 185, 0.322);
    padding: .5rem;
    border-radius: 50%;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: black;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
}

.categories {
    display: flex;
    gap: .5rem;
    margin-top: .5rem;
    margin-bottom: .5rem;
}

.categories span {
    background: #5d2b2b;
    border-radius: 14px;
    padding: .4rem;
    font-size: .8rem;
    color: white;
}

.dish-img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    border-radius: 14px;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
}

.name {
    font-weight: bold;
    font-size: 1.2rem;
    margin-top: .5rem;
}

.description {
    margin-top: .5rem;
}
</style>