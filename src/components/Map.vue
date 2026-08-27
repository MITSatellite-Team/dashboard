<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl from 'maplibre-gl'
import { onMounted, onUnmounted, watch, ref, computed, type Ref } from 'vue'
import { predict } from '../libs/prediction'

const props = defineProps<{
    gps: { latitude: number, longitude: number } | null
}>()

const launchLattitude = ref(42.2)
const launchLongitude = ref(-74.22)
const launchAltitude = ref(0)
const ascentRate = ref(5)
const descentRate = ref(5)
const burstAltitude = ref(30000)
const launchDate = ref('2026-05-02')
const launchTime = ref('08:00')

const launchTimestamp = computed(() => {
    if(!launchDate.value || !launchTime.value) return new Date().toISOString()

    return new Date(`${launchDate.value}T${launchTime.value}:00`).toISOString();
})

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null
let gpsMarker: maplibregl.Marker | null = null
let landingMarker: maplibregl.Marker | null = null
const predictedLocation: Ref<any | null> = ref(null)

async function updatePrediction(update = true) {
    if(!map) return
    
    try {
        const result = await predict(launchLattitude.value, launchLongitude.value, launchAltitude.value, launchTimestamp.value, ascentRate.value, burstAltitude.value, descentRate.value)
        
        const stagesNames = ['ascent', 'descent']
        for (const stage of stagesNames) {
            const id = `prediction-${stage}`

            if (map.getLayer(id)) map.removeLayer(id)
            if (map.getSource(id)) map.removeSource(id)
        }

        if (landingMarker) {
            landingMarker.remove()
            landingMarker = null
        }

        const stages = result.prediction.map((stage: any) => ({
            stage: stage.stage,
            coords: stage.trajectory.map((p: any) => [
                p.longitude > 180 ? p.longitude - 360 : p.longitude,
                p.latitude
            ] as [number, number]),
            color: stage.stage === 'ascent' ? '#00aaff'
                : stage.stage === 'descent' ? '#ff6600'
                : '#00ff88'
        }))

        for (const stage of stages) {
            map.addSource(`prediction-${stage.stage}`, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: stage.coords },
                    properties: {}
                }
            })

            map.addLayer({
                id: `prediction-${stage.stage}`,
                type: 'line',
                source: `prediction-${stage.stage}`,
                paint: {
                    'line-color': stage.color,
                    'line-width': 3,
                    'line-opacity': 0.8
                }
            })
        }

        const lastLocation = stages.at(-1)?.coords.at(-1)
        if (lastLocation) {
            landingMarker = new maplibregl.Marker().setLngLat(lastLocation).addTo(map)

            predictedLocation.value = lastLocation
        }
    } catch{}

    if(update) setTimeout(updatePrediction, 60000)
}

let watchId: number | null = null
const deviceLocation: Ref<any | null> = ref(null)
let deviceLocationMarker: maplibregl.Marker | null = null

onMounted(async () => {
    map = new maplibregl.Map({
        container: mapContainer.value!,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [-74.22, 42.2],
        zoom: 16
    })

    map.on('load', updatePrediction)

    if (!navigator.geolocation) return

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            deviceLocation.value = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }
        },
        (error) => console.error('GPS error:', error),
        { enableHighAccuracy: true, maximumAge: 5000 }
    )
})

watch(() => props.gps, (gps) => {
    if (!gps || !map) return

    const lngLat: [number, number] = [gps.longitude, gps.latitude]

    if (!gpsMarker) {
        gpsMarker = new maplibregl.Marker({ color: '#ff0000' })
            .setLngLat(lngLat)
            .addTo(map)
    } else {
        gpsMarker.setLngLat(lngLat)
    }

    // map.easeTo({ center: lngLat, duration: 200 })
})

watch(deviceLocation, (deviceLocation) => {
    if (!deviceLocation || !map) return
    const lngLat: [number, number] = [deviceLocation.longitude, deviceLocation.latitude]

    if (!deviceLocationMarker) {
        deviceLocationMarker = new maplibregl.Marker({ color: '#00ff00' })
            .setLngLat(lngLat)
            .addTo(map)
    } else {
        deviceLocationMarker.setLngLat(lngLat)
    }
})

onUnmounted(() => {
    map?.remove()

    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
})
</script>

<template>
    <div class="map-tools">
        <div>
            <h3>Predict</h3>

            <div class="label">
                <input type="time" v-model="launchTime">
                <input type="date" v-model="launchDate">
            </div>
            
            <div class="label">
                <span>Latitude</span>
                <input type="number" v-model="launchLattitude">
            </div>
            
            <div class="label">
                <span>Longitude</span>
                <input type="number" v-model="launchLongitude">
            </div>

            <div class="label">
                <span>Altitude</span>
                <input type="number" v-model="launchAltitude">
            </div>

            <div class="label">
                <span>Ascent Rate</span>
                <input type="number" v-model="ascentRate">
            </div>

            <div class="label">
                <span>Descent Rate</span>
                <input type="number" v-model="descentRate">
            </div>

            <div class="label">
                <span>Burst Altitude</span>
                <input type="number" v-model="burstAltitude">
            </div>

            <button @click="updatePrediction(false)">Predict</button>
        </div>

        <div v-if="predictedLocation">
            <h3>Predicted Location</h3>

            <div class="label">
                <span>Latitude</span>
                <span>{{ predictedLocation[1].toFixed(5) }}</span>
            </div>
            
            <div class="label">
                <span>Longitude</span>
                <span>{{ predictedLocation[0].toFixed(5) }}</span>
            </div>
        </div>

        <div v-if="deviceLocation">
            <h3>Your Location</h3>

            <div class="label">
                <span>Latitude</span>
                <span>{{ deviceLocation.latitude.toFixed(5) }}</span>
            </div>
            
            <div class="label">
                <span>Longitude</span>
                <span>{{ deviceLocation.longitude.toFixed(5) }}</span>
            </div>
        </div>
    </div>

    <div ref="mapContainer" class="map" />
</template>

<style scoped>
.map {
    width: 800px;
    height: 600px;
}

.map-tools {
    display: flex;
    gap: 40px;
}

.label {
    display: flex;
    gap: 20px;
}
</style>