<script setup lang="ts">
defineProps<{ valid: boolean, warn?: boolean }>()
</script>

<template>
<span class="indicator" :class="{ warn: warn, failed: !valid }"> {{ valid ? 'OK' : 'FAIL' }} </span>
</template>

<style scoped>
.indicator {
    background: greenyellow;
	color: black;

    padding: 2px 8px;
}

.indicator.warn {
    background: orange;
	color: white;
}

.indicator.failed {
    background: red;
	color: white;
}
</style>