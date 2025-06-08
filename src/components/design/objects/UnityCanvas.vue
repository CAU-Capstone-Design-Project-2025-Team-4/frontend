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

const inMemoryModels: number[] = [];
const enabledModels: number[] = [];

async function render(spatialRef: SpatialRef) {
    console.log('unity mounted')
    target.value = '#spatial-element';

    isCreatingInstance.value = true;
    await instanceManager.instantiate();
    isCreatingInstance.value = false;

    console.log('start render')

    enabledModels.forEach(modelId => {
        sendMessage('EnableModel', JSON.stringify({
            id: modelId,
            enable: false
        }));
    });
    enabledModels.length = 0;

    spatialRef.models.forEach(model => {
        if (inMemoryModels.includes(model.id)) {
            sendMessage('EnableModel', JSON.stringify({
                id: model.id,
                enable: true
            }));
            enabledModels.push(model.id);
            return;
        }
        
        sendMessage('LoadModel', JSON.stringify({
            id: model.id,
            url: model.url,
            enable: true,
            properties: {
                transform: model.transform,
                shader: model.shader
            }
        }));
        sendMessage('EnableModel', JSON.stringify({
                id: model.id,
                enable: true
            }));
        inMemoryModels.push(model.id);
        enabledModels.push(model.id);
    });

    // if (spatialRef.models.length > 0) {
    //     sendMessage('LoadModel', spatialRef.models[0].url);
    // } else {
    //     sendMessage('UnloadModel');
    // }
    sendMessage('SetCameraMode', spatialRef.cameraMode);
    sendMessage('SetCameraPositionAndRotation', JSON.stringify({
        positionAndRotation: spatialRef.cameraTransform, 
        interval: 0
    }));

    const cameraBackgroundMode = spatialRef.backgroundColor === 'skybox' ? 'skybox' : 'solid';
    sendMessage('SetCameraBackgroundMode', cameraBackgroundMode);
    if (cameraBackgroundMode === 'solid') {
        sendMessage('SetCameraBackgroundColor', spatialRef.backgroundColor);
    }

    width.value = 101;
    setTimeout(() => width.value -= 1, 1);
}

function unmount() {
    console.log('unity unmounted');
    target.value = BASE_CONTAINER;
}

function requestPointerLock() {
    context.requestPointerLock();
}

type Method = 'LoadModel' | 'UnloadModel' | 'EnableModel' | 'SetModelProperties' 
    | 'EnableInput' | 'SetCameraMode'  | 'SetCameraPositionAndRotation' | 'SetCameraBackgroundMode' | 'SetCameraBackgroundColor';
function sendMessage(method: Method, params?: any) {
    if (!instanceManager.hasInstance.value) return;
    
    context.sendMessage('Web Message Handler', method, params);
    console.log(`[Unity Canvas] Message sent to unity.\n${method}: ${params}`);
}

defineExpose({
    context,
    isCreatingInstance,
    render, unmount,
    sendMessage,
    requestPointerLock,
    setInstantiatedListener,
})

const width = ref<number>(0);
</script>

<template>
    <Teleport :to="target">
        <canvas ref="unity-canvas" id="unity-canvas" v-show="target !== BASE_CONTAINER" :style="{
            width: `${width}%`,
            height: `100%`
        }"></canvas>
    </Teleport>
</template>