<script setup lang="ts">
import Map from './components/Map.vue';

import { onMounted, ref, type Ref } from 'vue';
import type { Update } from './libs/data';
import SensorBlock from './components/SensorBlock.vue';
import { getSpot } from './libs/spot';
import Globe from './components/Globe.vue'
import Block from './components/Block.vue'
import StatusIndicator from './components/StatusIndicator.vue'

const data: Ref<Update | null> = ref(null)
const spotData: Ref<any | null> = ref(null)
const pathData: Ref<any[] | null> = ref(null)

async function update() {
    try {
        // const response = await fetch('http://35.222.71.40:8080/api/update')
        const response = await fetch('http://localhost:8080/api/update')
        const json = await response.json()

        data.value = json

		pathData.value = await (await fetch('http://localhost:8080/api/path')).json()

        // if(data.value && data.value.gpsFix === 0) {
        //     data.value.latitude = 42.2 * 100000
        //     data.value.longitude = -74.22 * 100000
        // }

        // const spot = await getSpot()
        // console.log(spot)
        // console.log(spot?.response?.feedMessageResponse?.messages)
        // if(spot?.response?.feedMessageResponse?.messages && spot.response.feedMessageResponse.messages.length > 0) {
        //     spotData.value = spot.response.feedMessageResponse.messages[0]
        // }

        setTimeout(update, 1000);
    } catch{
        setTimeout(update, 1000);
    }
}

async function updateSpot() {
    try {
        const spot = await getSpot()
		
        if(spot?.response?.feedMessageResponse?.messages?.message && spot.response.feedMessageResponse.messages.message.length > 0) {
            spotData.value = spot.response.feedMessageResponse.messages.message[0]
        }

        setTimeout(update, 30000);
    } catch{
        setTimeout(update, 30000);
    }
}

onMounted(async () => {
    update()
    updateSpot()
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
                <span>Beacon: {{ data.beacon }}</span>
                <span>Time Since Last Message: {{ Math.floor((Date.now() / 1000 - data.timestamp) / 60) }} minutes</span>
            </SensorBlock>

            <SensorBlock label="GPS" :valid="data.gpsValid" :warn="data.gpsFix < 2">
                <span>Fix: {{ gpsFixModes[data.gpsFix] }}</span>
                <span>Latitude: {{ (data.latitude / 100000).toFixed(5) }}°</span>
                <span>Longitude: {{ (data.longitude / 100000).toFixed(5) }}°</span>
                <span>Altitude: {{ (data.altitude).toFixed(2) }} m</span>
            </SensorBlock>

			<Block>
				<div style="display: flex; gap: 20px; margin-bottom: 10px">
					<StatusIndicator :valid="data.temperature0Valid" />
					Temperature 0: {{ data.temperature0.toFixed(2) }} °F
				</div>

				<div style="display: flex; gap: 20px; margin-bottom: 10px">
					<StatusIndicator :valid="data.temperature1Valid" />
					Temperature 1: {{ data.temperature1.toFixed(2) }} °F
				</div>

				<div style="display: flex; gap: 20px; margin-bottom: 10px">
					<StatusIndicator :valid="data.temperature2Valid" />
					Temperature 2: {{ data.temperature2.toFixed(2) }} °F
				</div>

				<div style="display: flex; gap: 20px; margin-bottom: 10px">
					<StatusIndicator :valid="data.temperature3Valid" />
					Temperature 3: {{ data.temperature3.toFixed(2) }} °F
				</div>
			</Block>

            <SensorBlock label="Barometer" :valid="data.baroValid">
                <span>Pressure: {{ data.pressure.toFixed(0) }} mbar</span>
                <span>Humidity: {{ data.humidity.toFixed(2) }}%</span>
            </SensorBlock>

            <SensorBlock label="Accelerometers" :valid="data.baroValid">
                <span>Acceleration: {{ data.ax.toFixed(2) }}, {{ data.ay.toFixed(2) }}, {{ data.az.toFixed(2) }} m/s^2</span>
                <span>Gyro: {{ data.gx.toFixed(3) }}, {{ data.gy.toFixed(3) }}, {{ data.gz.toFixed(3) }} rad/s</span>
                <span>Gyro: {{ data.mx.toFixed(2) }}, {{ data.my.toFixed(2) }}, {{ data.mz.toFixed(2) }} mT</span>
            </SensorBlock>

            <SensorBlock label="Spot" :valid="spotData != null">
                <span>Id: {{ spotData?.id }}</span>
                <span>Timestamp: {{ spotData?.dateTime }}</span>
                <span>Latitude: {{ spotData?.latitude }}</span>
                <span>Longitude: {{ spotData?.longitude }}</span>
                <span>Altitude: {{ spotData?.altitude }}</span>
                <span>Battery State: {{ spotData?.batteryState }}</span>
            </SensorBlock>
        </div>
    </div>

    <div v-else>
        <p>Waiting to receive data...</p>
    </div>

	<div class="data-blocks">
		<Block>
			<Globe :path="pathData" style="margin-top: auto; margin-bottom: auto;" />
		</Block>

		<Block>
			<Map :gps="data ? { latitude: data.latitude / 100000, longitude: data.longitude / 100000 } : null" />
		</Block>
	</div>
</template>

<style scoped>
.data-blocks {
    display: flex;
    flex-wrap: wrap;
}
</style>