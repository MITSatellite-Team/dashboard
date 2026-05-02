<script setup lang="ts">
import Map from './components/Map.vue';

import { onMounted, ref, type Ref } from 'vue';
import type { Update } from './libs/data';
import SensorBlock from './components/SensorBlock.vue';

const data: Ref<Update | null> = ref(null)

async function update() {
    try {
        const response = await fetch('http://35.222.71.40:8080/api/update')
        const json = await response.json()

        data.value = json

        if(data.value) {
            data.value.latitude = 42.2 * 100000
            data.value.longitude = -74.22 * 100000
        }

        setTimeout(update, 1000);
    } catch{
        setTimeout(update, 1000);
    }
}

onMounted(async () => {
    update()
})

const gpsFixModes = [ 'No Fix', 'Prediction', '2D', '3D', 'Differential' ]

</script>

<template>
    <!-- <p style="white-space: pre;">{{ JSON.stringify(data, null, 2) }}</p> -->

    <div v-if="data">
        <div class="data-blocks">
            <SensorBlock label="Latest Packet" :valid="true">
                <span>Id: {{ data.id }}</span>
                <span>Timestamp: {{ new Date(data.timestamp * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'America/New_York' }) }}</span>
            </SensorBlock>

            <SensorBlock label="GPS" :valid="data.gpsValid" :warn="data.gpsFix < 2">
                <span>Fix: {{ gpsFixModes[data.gpsFix] }}</span>
                <span>Latitude: {{ (data.latitude / 100000).toFixed(3) }}°</span>
                <span>Longitude: {{ (data.longitude / 100000).toFixed(3) }}°</span>
                <span>Altitude: {{ (data.altitude).toFixed(2) }} m</span>
            </SensorBlock>

            <SensorBlock label="Temperature 0" :valid="data.temperature0Valid">
                <span>{{ data.temperature0.toFixed(2) }} °F</span>
            </SensorBlock>
            <SensorBlock label="Temperature 1" :valid="data.temperature1Valid">
                <span>{{ data.temperature1.toFixed(2) }} °F</span>
            </SensorBlock>
            <SensorBlock label="Temperature 2" :valid="data.temperature2Valid">
                <span>{{ data.temperature2.toFixed(2) }} °F</span>
            </SensorBlock>
            <SensorBlock label="Temperature 3" :valid="data.temperature3Valid">
                <span>{{ data.temperature3.toFixed(2) }} °F</span>
            </SensorBlock>

            <SensorBlock label="Barometer" :valid="data.baroValid">
                <span>Pressure: {{ data.pressure.toFixed(0) }} mbar</span>
                <span>Humidity: {{ data.humidity.toFixed(2) }}%</span>
            </SensorBlock>

            <SensorBlock label="Accelerometers" :valid="data.baroValid">
                <span>Acceleration: {{ data.ax.toFixed(2) }}, {{ data.ay.toFixed(2) }}, {{ data.az.toFixed(2) }} m/s^2</span>
                <span>Gyro: {{ data.gx.toFixed(3) }}, {{ data.gy.toFixed(3) }}, {{ data.gz.toFixed(3) }} rad/s</span>
                <span>Gyro: {{ data.mx.toFixed(2) }}, {{ data.my.toFixed(2) }}, {{ data.mz.toFixed(2) }} mT</span>
            </SensorBlock>
        </div>
    </div>
    <div v-else>
        <p>Waiting to receive data...</p>
    </div>

    <div style="width: 800px; height: 600px">
        <Map :gps="data ? { latitude: data.latitude / 100000, longitude: data.longitude / 100000 } : null" />
    </div>
</template>

<style scoped>
.data-blocks {
    display: flex;
    flex-wrap: wrap;
}
</style>