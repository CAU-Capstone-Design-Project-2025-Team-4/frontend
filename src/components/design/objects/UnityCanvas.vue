<script setup lang="ts">
import { onceAsync } from '@/common/async';
import { useDesignStore } from '@/stores/design';
import type { Model, SpatialRef } from '@/types/ObjectRef';
import UnityWebgl from 'unity-webgl';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

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
            

            if (typeof instantiatedCallback === 'function') {
                instantiatedCallback();
            }

            console.log('[UnityCanvas] Instantiate finished.');
        });

        return instancePromise;
    }

    const hasInstance = computed<boolean>(() => instancePromise !== null);

    return { instantiate, hasInstance };
}

const enabledModels: number[] = [];

async function render(spatialRef: SpatialRef) {
    console.log('unity mounted')
    target.value = '#spatial-element';

    const flag = instanceManager.hasInstance.value;

    isCreatingInstance.value = true;
    await instanceManager.instantiate();
    isCreatingInstance.value = false;

    console.log('start render')

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

    if (!flag) return;

    enabledModels.forEach(modelId => {
        sendMessage('EnableModel', JSON.stringify({
            id: modelId,
            enable: false
        }));
    });
    enabledModels.length = 0;

    for (const model of spatialRef.models) {
        if (inMemoryModels.has(model.id)) {
            sendMessage('EnableModel', JSON.stringify({
                id: model.id,
                enable: true
            }));
            enabledModels.push(model.id);
            continue;
        }

        inMemoryModels.set(model.id, onceAsync(() => loadModel(model)));
        await inMemoryModels.get(model.id)!();

        sendMessage('EnableModel', JSON.stringify({
            id: model.id,
            enable: true
        }));
        enabledModels.push(model.id);
    }

    setTimeout(() => design.notifyChangeListeners(), 50);
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
    if (!instanceManager.hasInstance.value) {
        return;
    }
    
    context.sendMessage('Web Message Handler', method, params);
    console.log(`[Unity Canvas] Message sent to unity.\n${method}: ${params}`);
}

async function loadModel(model: Model) {
    sendMessage('LoadModel', JSON.stringify({
        id: model.id,
        url: model.url,
        enable: true,
        properties: {
            transform: model.transform,
            shader: model.shader
        }
    }));

    await waitForModelLoading(model.id);
}

function waitForModelLoading(modelId: number) {
    return new Promise((resolve, reject) => {
        const listener = (id: number) => {
            clearTimeout(timeout);

            context.removeUnityListener('ModelLoad', listener);
            if (id == modelId) {
                resolve(id);
            }
            reject(`unknown id ${id} =/= ${modelId}, ${id === modelId} ${id == modelId}`);
        }
        const timeout = setTimeout(() => {
            context.removeUnityListener('ModelLoad', listener);
            reject('timeout');
            // resolve(modelId);
        }, 10000);

        context.addUnityListener('ModelLoad', listener);
    })
}

const inMemoryModels = new Map<number, () => Promise<void>>;

const design = useDesignStore();
const isLoadingModels = ref<boolean>(false);
async function loadAll(models: Model[]) {
    if (models.length <= 0) return;
    
    isLoadingModels.value = true;
    await instanceManager.instantiate();

    for (const model of models) {
        if (inMemoryModels.has(model.id)) continue;
        inMemoryModels.set(model.id, onceAsync(() => loadModel(model)));
    }
    
    for (const [ key, task ] of inMemoryModels) {
        await task().catch(_ => {
            inMemoryModels.delete(key);
        });
    }

    isLoadingModels.value = false;
    design.notifyChangeListeners();
}


defineExpose({
    context,
    isCreatingInstance,
    render, unmount,
    sendMessage,
    requestPointerLock,
    setInstantiatedListener,
    loadAll,
    isLoadingModels
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