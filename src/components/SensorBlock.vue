<script setup lang="ts">
import StatusIndicator from './StatusIndicator.vue'
import Block from './Block.vue'

defineProps<{ label: string, valid: boolean, warn?: boolean }>()
</script>

<template>
	<Block>
    	<div class="label">
			<status-indicator :valid="valid" :warn="warn" />
            <span>{{ label }}</span>
        </div>
        
        <slot />
	</Block>
</template>

<style scoped>
.label {
    display: flex;
    gap: 20px;

    align-items: center;

	color: var(--text);
}

</style>