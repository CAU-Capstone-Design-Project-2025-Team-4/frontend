<script setup lang="ts">
import { provide, useTemplateRef } from 'vue';
import UnityCanvas from './components/design/objects/UnityCanvas.vue';

const unity = useTemplateRef<InstanceType<typeof UnityCanvas>>('unity');
provide('unity', unity);

</script>

<template>
  <UnityCanvas ref="unity" />
  <router-view class="absolute left-0 top-0" />
</template>
