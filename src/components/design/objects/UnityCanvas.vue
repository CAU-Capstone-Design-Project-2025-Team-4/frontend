<script setup lang="ts">
import { onceAsync } from '@/common/async';
import { useDesignStore } from '@/stores/design';
import type { Model, SpatialRef } from '@/types/ObjectRef';
import UnityWebgl from 'unity-webgl';
import { computed, nextTick, ref, useTemplateRef } from 'vue';

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

const inMemoryModels = new Map<number, () => Promise<void>>;
const enabledModels: number[] = [];

async function render(spatialRef: SpatialRef) {
    console.log('unity mounted')
    console.log('inMemory', inMemoryModels)
    console.log('enabled', enabledModels)
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

    width.value = 99;
    setTimeout(() => {
        width.value = 100;
        design.notifyChangeListeners();
    }, 50);

    enabledModels.forEach(modelId => {
        sendMessage('EnableModel', JSON.stringify({
            id: modelId,
            enable: false
        }));
    });
    enabledModels.length = 0;

    if (!flag) return;

    console.log(spatialRef.models);
    for (const model of spatialRef.models) {
        if (inMemoryModels.has(model.id)) {
            sendMessage('EnableModel', JSON.stringify({
                id: model.id,
                enable: true
            }));
            if (!enabledModels.includes(model.id)) enabledModels.push(model.id);
            continue;
        }

        await loadModel(model);

        sendMessage('EnableModel', JSON.stringify({
            id: model.id,
            enable: true
        }));
        if (!enabledModels.includes(model.id)) enabledModels.push(model.id);
        console.log(enabledModels);
    }
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

async function _loadModel(model: Model, enabled: boolean = true) {
    sendMessage('LoadModel', JSON.stringify({
        id: model.id,
        url: model.url,
        enable: enabled,
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
    });
}

const design = useDesignStore();
const isLoadingModels = ref<boolean>(false);
async function loadAll(models: Model[]) {
    if (models.length <= 0) return;
    
    isLoadingModels.value = true;

    // await nextTick();
    target.value = '#spatial-element';

    await instanceManager.instantiate();

    for (const model of models) {
        if (inMemoryModels.has(model.id)) continue;
        inMemoryModels.set(model.id, onceAsync(() => _loadModel(model, false)));
    }
    
    for (const [ key, task ] of inMemoryModels) {
        await task().catch(_ => {
            inMemoryModels.delete(key);
        });
    }

    isLoadingModels.value = false;

    await nextTick();
    if (document.getElementById('spatial-element') === null) {
        target.value = BASE_CONTAINER;
    }

    design.notifyChangeListeners();
}

const hover = ref<boolean>(false);
function highlightOnHover(_hover: boolean) {
    hover.value = _hover;
}

async function loadModel(model: Model) {
    if (inMemoryModels.has(model.id)) return;

    inMemoryModels.set(model.id, onceAsync(() => _loadModel(model)));
    await inMemoryModels.get(model.id)!().catch(_ => {
        inMemoryModels.delete(model.id);
    });
    if (!enabledModels.includes(model.id)) enabledModels.push(model.id);
    console.log('load', inMemoryModels, enabledModels);

    setTimeout(() => design.notifyChangeListeners(), 200);
}


defineExpose({
    context,
    isCreatingInstance,
    render, unmount,
    sendMessage,
    requestPointerLock,
    setInstantiatedListener,
    loadAll, loadModel,
    isLoadingModels,
    canvas,
    highlightOnHover
})

const width = ref<number>(100);
</script>

<template>
    <Teleport :to="target">
        <canvas ref="unity-canvas" id="unity-canvas" v-show="target !== BASE_CONTAINER" class="hover:cursor-move" :class="{ 'outline-size-8 outline-solid outline-[rgba(45,212,191,0.5)]': hover }" :style="{
            width: `${width}%`,
            height: `100%`
        }"></canvas>
    </Teleport>
</template>