<script setup lang="ts">
</script>

<template>
    <div class="block">    
        <slot />
    </div>
</template>

<style scoped>
.block {
    border: 1px var(--text) dashed;

	margin: 20px;
    padding: 20px;

    display: flex;
    flex-direction: column;

    width: fit-content;
}

</style>