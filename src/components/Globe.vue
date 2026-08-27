<script setup lang="ts">
import Globe from 'globe.gl'
import * as THREE from 'three'

import { onMounted, useTemplateRef, watch } from 'vue'

const props = defineProps<{
    path: { latitude: number, longitude: number, altitude: number }[] | null
}>()

const displayElement = useTemplateRef('displayElement')

onMounted(() => {
	if(!displayElement.value) return

	const markerSvg = `<svg viewBox="-4 0 36 36">
		<path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
		<circle fill="black" cx="14" cy="14" r="7"></circle>
	</svg>`

	//43.203855, -70.919995

	const globe = new Globe(displayElement.value, { animateIn: false })
		.globeTileEngineUrl((x, y, l) => `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${l}`)
		.htmlElementsData([{ lat: 43.203855, lng: -70.919995, size: 20, color: 'red' }])
		.htmlElement(d => {
			const el = document.createElement('div');
			el.innerHTML = markerSvg;
			el.style.color = d.color;
			el.style.width = `${d.size}px`;
			el.style.transition = 'opacity 250ms';

			el.style['pointer-events'] = 'auto';
			el.style.cursor = 'pointer';
			return el;
		})

	globe.camera().near = 0.001

	globe.controls().minDistance = 100.005

	let focused = false

	function focusOnPath(points: { latitude: number, longitude: number }[]) {
		if (focused) return

		focused = true

		const lats = points.map(p => p.latitude)
		const lngs = points.map(p => p.longitude)

		const minLat = Math.min(...lats), maxLat = Math.max(...lats)
		const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)

		const lat = (minLat + maxLat) / 2
		const lng = (minLng + maxLng) / 2

		const latSpan = maxLat - minLat
		const lngSpan = maxLng - minLng
		const maxSpan = Math.max(latSpan, lngSpan)

		const altitude = Math.max(0.1, Math.min(2.5, maxSpan * 0.03))

		globe.pointOfView({ lat, lng, altitude }, 1000)
	}
	
	function updatePath() {
		if(!props.path) return

		const path = props.path.filter(item => item.latitude !== 0 && item.altitude !== 20000).map(item => [item.latitude, item.longitude, item.altitude])
		const shadowPath = props.path.filter(item => item.latitude !== 0 && item.altitude !== 20000).map(item => [item.latitude, item.longitude, 10000000 / 6371000])

		focusOnPath(props.path.filter(item => item.latitude !== 0 && item.altitude !== 20000))

		globe
		.pathsData([path, shadowPath])
		.pathColor((path: any) => path[0][2] !== 10000000 / 6371000 ? ['#ffe600', '#ffe600'] : ['#000000', '#000000'])
		.pathTransitionDuration(0)
		.pathPointAlt(pnt => pnt[2] / 6371000)
		.pathStroke(2)
	}

	watch(props, () => {
		updatePath()
	})

	const updateSize = function () {
		if (!displayElement.value) return

		globe.width(displayElement.value.clientWidth)
			.height(displayElement.value.clientHeight)
	}

	updateSize()

	const observer = new ResizeObserver(updateSize)
	observer.observe(displayElement.value)
})
</script>

<template>
<div class="display-element" ref="displayElement"></div>
</template>

<style scoped>
.display-element {
	width: 800px;
	height: 600px;
}
</style>