<script setup lang="ts">
import type { SpatialRef } from '@/types/ObjectRef';
import UnityWebgl from 'unity-webgl';
import { computed, ref, useTemplateRef } from 'vue';

const context = new UnityWebgl({
    loaderUrl: "/unity/Build.loader.js",
    dataUrl: "/unity/Build.data.br",
    frameworkUrl: "/unity/Build.framework.js.br",
    codeUrl: "/unity/Build.wasm.br",
    companyName: 'CAU Capsotne',
    productName: 'PRISM',
    productVersion: 'v0.1.0-alpha',
    webglContextAttributes: {
        preserveDrawingBuffer: true,
    }
});

const BASE_CONTAINER = 'body';
const target = ref<string>(BASE_CONTAINER);

const canvas = useTemplateRef<HTMLElement>('unity-canvas');
const instanceManager = createInstanceManager();
const isCreatingInstance = ref<boolean>(false);

let instantiatedCallback: () => void;
function setInstantiatedListener(callback: () => void) {
    instantiatedCallback = callback;
}

function createInstanceManager() {
    let instancePromise: Promise<void> | null = null;
    function instantiate() {
        if (instancePromise !== null) {
            return instancePromise;
        }

        instancePromise = new Promise<void>(async resolve => {
            await context.render(canvas.value as HTMLCanvasElement);

            resolve();

            await new Promise(resolve => setTimeout(resolve, 1));
            instantiatedCallback();

            console.log('[UnityCanvas] Instantiate finished.');
        });

        return instancePromise;
    }

    const hasInstance = computed<boolean>(() => instancePromise !== null);

    return { instantiate, hasInstance };
}

async function render(spatialRef: SpatialRef) {
    console.log('unity mounted')
    target.value = '#spatial-element';

    isCreatingInstance.value = true;
    await instanceManager.instantiate();
    isCreatingInstance.value = false;

    if (spatialRef.model !== null) {
        sendMessage('LoadModel', spatialRef.model);
    } else {
        sendMessage('UnloadModel');
    }
    sendMessage('SetCameraMode', spatialRef.cameraMode);
    sendMessage('SetCameraPositionAndRotation', JSON.stringify(spatialRef.cameraTransform));

    const cameraBackgroundMode = spatialRef.backgroundColor === 'skybox' ? 'skybox' : 'solid';
    sendMessage('SetCameraBackgroundMode', cameraBackgroundMode);
    if (cameraBackgroundMode === 'solid') {
        sendMessage('SetCameraBackgroundColor', spatialRef.backgroundColor);
    }
}

function unmount() {
    console.log('unity unmounted');
    target.value = BASE_CONTAINER;
}

function requestPointerLock() {
    context.requestPointerLock();
}

type Method = 'LoadModel' | 'UnloadModel' | 'SetCameraMode' | 'SetPlayMode' | 'EnableInput' | 'SetCameraPositionAndRotation' | 'SetCameraBackgroundMode' | 'SetCameraBackgroundColor';
function sendMessage(method: Method, params?: any) {
    if (!instanceManager.hasInstance.value) return;
    
    context.sendMessage('Web Message Handler', method, params);
    console.log(`[Unity Canvas] Message sent to unity.\n${method}: ${params}`);
}

defineExpose({
    isCreatingInstance,
    render, unmount,
    sendMessage,
    requestPointerLock,
    setInstantiatedListener
})

</script>

<template>
    <Teleport :to="target">
        <canvas ref="unity-canvas" id="unity-canvas" v-show="target !== BASE_CONTAINER" class="w-full h-full"></canvas>
    </Teleport>
</template>