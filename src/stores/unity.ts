import type { SpatialRef } from "@/types/ObjectRef";
import { defineStore } from "pinia";
import UnityWebgl from "unity-webgl";
import { ref } from "vue";

export const useUnityStore = defineStore('unity', () => {
    const context = new UnityWebgl({
        loaderUrl: "unity/Build.loader.js",
        dataUrl: "unity/Build.data.br",
        frameworkUrl: "unity/Build.framework.js.br",
        codeUrl: "unity/Build.wasm.br",
    });

    const hasInstance = ref<boolean>(false);
    let instance: HTMLCanvasElement | null = null;
    
    async function instantiate() {
        if (instance != null) return;

        instance = document.createElement('canvas');
        instance.id = 'unity-canvas';
        instance.className = 'w-full h-full invisible';
        document.getElementById('app')!.appendChild(instance);

        await context.render(instance);

        await new Promise(resolve => setTimeout(resolve, 2500));
        hasInstance.value = true;

        callbacks.forEach(callback => callback());
    }

    const callbacks: (() => void)[] = [];
    function addInstantiatedListener(listener: () => void) {
        callbacks.push(listener);
    }

    async function render(parent: HTMLElement, spatialRef: SpatialRef) {
        if (!hasInstance.value) {
            console.log('insta')
            await instantiate();
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        if (spatialRef.model !== null) {
            sendMessage('LoadModel', spatialRef.model ?? 'null');
        }
        sendMessage('SetCameraMode', spatialRef.cameraMode);
        sendMessage('SetCameraPositionAndRotation', JSON.stringify(spatialRef.cameraTransform));

        const cameraBackgroundMode = spatialRef.backgroundColor === 'skybox' ? 'skybox' : 'solid';
        console.log(cameraBackgroundMode);
        sendMessage('SetCameraBackgroundMode', cameraBackgroundMode);
        if (cameraBackgroundMode === 'solid') {
            console.log('hi?')
            sendMessage('SetCameraBackgroundColor', spatialRef.backgroundColor);
        }

        instance!.className = 'w-full h-full';
        parent.appendChild(instance!);
    }

    type Method = 'LoadModel' | 'SetCameraMode' | 'SetPlayMode' | 'EnableInput' | 'SetCameraPositionAndRotation' | 'SetCameraBackgroundMode' | 'SetCameraBackgroundColor';
    function sendMessage(method: Method, params: any) {
        if (!hasInstance.value) {
            console.error('Unity context must be instantiated before send message.');
            return;
        }

        context.sendMessage('Web Message Handler', method, params);
    }

    return { instantiate, hasInstance, addInstantiatedListener, render, sendMessage }
})