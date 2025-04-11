<script setup lang="ts">

import { UnityInstance } from 'unity-webgl';
import { onMounted } from 'vue';


onMounted(() => {
  loadUnity();
});

function loadUnity() {
  const unityContainer = document.getElementById('unity-container');
  createUnity
  UnityLoader.instantiate(
    'unity-container',
    '/unity/Build/Build.json', // WebGL 빌드 JSON 경로
    { 
      onProgress: (unityInstance, progress) => {
        console.log('Unity Loading Progress:', progress);
      }
    }
  );

  createUnity
}
</script>


<template>
    <router-link to='/editor'>
        Hello World!
    </router-link>
    <div id="unity-container"></div>


</template>