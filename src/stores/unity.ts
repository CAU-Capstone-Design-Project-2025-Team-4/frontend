import type { SpatialRef } from "@/types/ObjectRef";
import { defineStore } from "pinia";
import UnityWebgl from "unity-webgl";
import { ref } from "vue";

export const useUnityStore = defineStore('unity', () => {
    const context = new UnityWebgl({
        loaderUrl: "unity.loader.js",
        dataUrl: "unity.data.br",
        frameworkUrl: "unity.framework.js.br",
        codeUrl: "unity.wasm.br",
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
    }

    function render(parent: HTMLElement, spatialRef: SpatialRef) {
        if (instance === null) {
            console.error('Unity context must be instantiated before rendering.')
            return;
        }

        sendMessage('LoadModel', spatialRef.model);
        sendMessage('SetCameraMode', spatialRef.cameraMode);
        sendMessage('SetCameraTransform', JSON.stringify(spatialRef.cameraTransform))

        instance.className = 'w-full h-full';
        parent.appendChild(instance);
    }

    type Method = 'LoadModel' | 'SetCameraMode' | 'SetPlayMode' | 'EnableInput' | 'SetCameraTransform' | 'SetBackgroundColor';
    function sendMessage(method: Method, params: any) {
        if (instance === null) {
            console.error('Unity context must be instantiated before send message.')
            return;
        }

        context.sendMessage('Web Message Handler', method, params);
    }

    return { instantiate, hasInstance, render, sendMessage }
})