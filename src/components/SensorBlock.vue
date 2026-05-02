<script setup lang="ts">
defineProps<{ label: string, valid: boolean, warn?: boolean }>()
</script>

<template>
    <div class="sensor-block">
        <div class="label">
            <span class="indicator" :class="{ warn: warn, failed: !valid }"> {{ valid ? 'OK' : 'FAIL' }} </span>
            <span>{{ label }}</span>
        </div>
        
        <slot />
    </div>
</template>

<style scoped>
.sensor-block {
    border: 1px black solid;

    padding: 20px;

    display: flex;
    flex-direction: column;

    width: fit-content;
}

.label {
    display: flex;
    gap: 20px;

    align-items: center;
}

.indicator {
    background: greenyellow;

    padding: 8px;
}

.indicator.warn {
    background: orange;
}

.indicator.failed {
    background: red;
}
</style>