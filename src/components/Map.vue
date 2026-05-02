<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl from 'maplibre-gl'
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { predict } from '../libs/prediction'

const props = defineProps<{
    gps: { latitude: number, longitude: number } | null
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null
let gpsMarker: maplibregl.Marker | null = null

onMounted(async () => {
    map = new maplibregl.Map({
        container: mapContainer.value!,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [-74.22, 42.2],
        zoom: 16
    })

    map.on('load', async () => {
        const result = await predict(42.2, -74.22, 0, '2026-05-01T19:22:23.000Z', 5, 30000, 5)

        const stages = result.prediction.map(stage => ({
            stage: stage.stage,
            coords: stage.trajectory.map(p => [
                p.longitude > 180 ? p.longitude - 360 : p.longitude,
                p.latitude
            ] as [number, number]),
            color: stage.stage === 'ascent' ? '#00aaff'
                : stage.stage === 'descent' ? '#ff6600'
                : '#00ff88'
        }))

        for (const s of stages) {
            map!.addSource(`prediction-${s.stage}`, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: s.coords },
                    properties: {}
                }
            })

            map!.addLayer({
                id: `prediction-${s.stage}`,
                type: 'line',
                source: `prediction-${s.stage}`,
                paint: {
                    'line-color': s.color,
                    'line-width': 3,
                    'line-opacity': 0.8
                }
            })
        }

        // Landing marker
        const last = stages.at(-1)?.coords.at(-1)
        if (last) new maplibregl.Marker().setLngLat(last).addTo(map!)
    })
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

onUnmounted(() => {
    map?.remove()
})
</script>

<template>
    <div ref="mapContainer" class="map" />
</template>

<style scoped>
.map {
    width: 100%;
    height: 100%;
}
</style>