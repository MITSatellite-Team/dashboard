<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import type { Update } from './libs/data';

const data: Ref<Update | null> = ref(null)

async function update() {
    try {
        const response = await fetch('http://35.222.71.40:8080/api/update')
        const json = await response.json()

        data.value = json

        setTimeout(update, 20);
    } catch{
        setTimeout(update, 1000);
    }
}

onMounted(() => {
    update()
})

</script>

<template>
    <p style="white-space: pre;">{{ JSON.stringify(data, null, 2) }}</p>
</template>
