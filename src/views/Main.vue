<script setup lang="ts">
import UnityWebgl from 'unity-webgl';
import UnityVue from 'unity-webgl/vue';

const unity = new UnityWebgl({
    loaderUrl: "unity.loader.js",
    dataUrl: "unity.data.br",
    frameworkUrl: "unity.framework.js.br",
    codeUrl: "unity.wasm.br",
})

const unity2 = new UnityWebgl({
    loaderUrl: "unity.loader.js",
    dataUrl: "unity.data.br",
    frameworkUrl: "unity.framework.js.br",
    codeUrl: "unity.wasm.br",
})
</script>


<template>
    <router-link to='/editor'>
        Hello World!
    </router-link>
    <UnityVue :unity="unity" />
    <UnityVue :unity="unity2" />

</template>