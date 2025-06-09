<script setup lang="ts">
import { type Slide, useDesignStore } from '@/stores/design';
import Canvas from './design/Canvas.vue';
import { computed, inject, onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import type { Animation } from '@/types/Animation';
import type UnityCanvas from './design/objects/UnityCanvas.vue';
import { useEventListener, useMouseInElement } from '@vueuse/core';
import { type CameraTransform, instanceOfSpatialRef, type SpatialRef } from '@/types/ObjectRef';
import { useSuspendableWait as useSuspendableWait } from '@/common/async';

const design = useDesignStore();
const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;

const container = useTemplateRef<HTMLElement>('container');
const containerWidth = computed<number | undefined>(() => container.value?.getBoundingClientRect().width);

const slideIndex = ref<number>(-1);

const animationIndex = ref<number>(0);
const animations = computed<Animation[]>(() => {
    return design.currentSlide.animations;
});
const animation = computed<Animation>(() => {
    return animations.value[animationIndex.value];
})

const animatedSlide = ref<Slide>();

const unityCanvas = ref<HTMLElement | null>(unity.value.canvas);
const { x, y, isOutside } = useMouseInElement(unityCanvas);

const onHover = computed<boolean>(() => {
    if (!isOutside.value && document.elementFromPoint(x.value, y.value)?.contains(unityCanvas.value)) return true;
    return false;
})

watch(() => onHover.value, () => {
    unity.value.highlightOnHover(onHover.value);
    unityCanvas.value!.style.cursor = onHover.value ? 'pointer' : 'auto';
})

const focus = ref<HTMLElement | null>(null);
const hasFocusOnUnity = computed<boolean>(() => focus.value?.id === 'unity-canvas');
const showUnityAlert = ref<boolean>(false);
const unityAlertTransition = ref<string>('fade');
let alertTimeout: number | null = null;

const { wait, suspend, resume } = useSuspendableWait();
const isAnimating = ref<boolean>(false);
const transitionTo = ref<CameraTransform | null>(null);

async function interact(e: PointerEvent) {
    if (hasFocusOnUnity.value) return;

    focus.value = e.target as HTMLElement;
    if (hasFocusOnUnity.value) {
        unity.value.requestPointerLock();
        unity.value.sendMessage('EnableInput', 'true');

        unityAlertTransition.value = 'fade';
        showUnityAlert.value = true;
        alertTimeout = setTimeout(() => showUnityAlert.value = false, 3700);
        return;
    } 

    if (alertTimeout) {
        unityAlertTransition.value = 'fase-fade';
        showUnityAlert.value = false;

        clearTimeout(alertTimeout);
        alertTimeout = null;
    }

    if (isAnimating.value) {
        console.log(transitionTo.value)
        if (transitionTo.value !== null) {
            unity.value.sendMessage('SetCameraPositionAndRotation', JSON.stringify({
                positionAndRotation: transitionTo.value,
                interval: 0
            }));
            transitionTo.value = null
        }
        suspend();
        return;
    }

    let duration: number = 0;

    if (animationIndex.value < animations.value.length) {        
        isAnimating.value = true;
        resume();
        do {
            if (animation.value.timing === 'after_previous') {
                await wait(duration * 1000);
            }

            const element = animatedSlide.value?.elements.find(elem => animation.value.element.id === elem.id)!;
            switch (animation.value.effect) {
                case 'appear':
                    element.visiblity = true;
                    break;
                case 'disappear':
                    element.visiblity = false;
                    break;
                case 'frame_transition':
                    transitionTo.value = animation.value.frame!.cameraTransform;
                    unity.value.sendMessage('SetCameraPositionAndRotation', JSON.stringify({
                        positionAndRotation: animation.value.frame?.cameraTransform,
                        interval: animation.value.duration
                    }));
                    break;
            }

            duration = animation.value.duration;
            animationIndex.value += 1;
        } while (animationIndex.value < animations.value.length && animation.value.timing !== 'on_click');

        isAnimating.value = false;
    } else {
        if (slideIndex.value + 1 < design.slides.length) {
            slideIndex.value += 1;   
        } else {
            isEnded.value = true;
        }
    }
}

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'q') {
        e.preventDefault();

        focus.value = null;

        document.exitPointerLock();
        unity.value.sendMessage('EnableInput', 'false');

        if (alertTimeout) {
            unityAlertTransition.value = 'fase-fade';
            showUnityAlert.value = false;

            clearTimeout(alertTimeout);
            alertTimeout = null;
        }
    }
})

onMounted(() => {
    slideIndex.value = 0;
    computeAnimatedSlide();

    const models = design.slides.flatMap(slide => {
        return slide.elements
            .filter(elem => instanceOfSpatialRef(elem.objectRef))
            .map(elem => (elem.objectRef as SpatialRef).models);
    }).flat();

    unity.value.loadAll(models);
})

watch(() => slideIndex.value, () => {
    design.selectSlide(slideIndex.value);
})


watch(() => design.currentSlide?.id, () => {
    computeAnimatedSlide();
})

function computeAnimatedSlide() {
    animationIndex.value = 0;
    animatedSlide.value = { ...design.currentSlide };

    animatedSlide.value.elements.forEach(elem => {
        const firstAnimation = animations.value.find(anim => anim.element.id === elem.id);
        if (firstAnimation?.effect === 'appear') {
            elem.visiblity = false;
        } else {
            elem.visiblity = true;
        }
    });

    const spatial = animatedSlide.value?.elements.find(elem => instanceOfSpatialRef(elem.objectRef));
    if (spatial) {
        unity.value.sendMessage('SetCameraPositionAndRotation', JSON.stringify({
            positionAndRotation: (spatial.objectRef as SpatialRef).cameraTransform,
            interval: 0
        }));
    }
}

function toFirst() {
    slideIndex.value = 0;
    animationIndex.value = 0;
    computeAnimatedSlide();
}

function toPrevious() {
    if (slideIndex.value > 0) {
        slideIndex.value -= 1;
    }

    animationIndex.value = 0;
    computeAnimatedSlide();
}

function toNext() {
    if (slideIndex.value + 1 < design.slides.length) {
        slideIndex.value += 1;
        animationIndex.value = 0;
    } else {
        animationIndex.value = animations.value.length - 1;
    }

    computeAnimatedSlide();
}

function toLast() {
    slideIndex.value = design.slides.length - 1;
    animationIndex.value = animations.value.length - 1;
    computeAnimatedSlide();
}

defineExpose({
    toFirst,
    toPrevious,
    toNext,
    toLast,
    slideIndex
})

const isEnded = defineModel<boolean>();
</script>

<template>
    <div ref="container" class="w-full h-full relative select-none">
        <Teleport to="body">
            <Transition :name="unityAlertTransition">
                <div v-if="showUnityAlert" class="flex justify-center items-center flex-row fixed top-12 left-[50%] translate-x-[-50%] w-[16.5%] min-w-90 h-12 select-none bg-gray-950 bg-opacity-68">
                    <p class="text-white text-center">3D 조작을 종료하려면</p>
                    <span class="block w-8 h-8 mx-2 text-white text-center leading-8 border border-white">Q</span>
                    <p class="text-white text-center">키를 길게 누르세요.</p>
                </div>
            </Transition>
        </Teleport>
        
        <div class="relative" :style="{
            transformOrigin: `left top`,
            transform: `scale(${containerWidth! / 1920})`,
            width: `${1920}px`,
            height: `${1080}px`
        }" @pointerup.left="interact($event)">
            <Canvas :slide="design.currentSlide" class="w-full aspect-video" />
        </div>

        <div id="spatial-element" v-if="unity.isLoadingModels" class="absolute left-0 top-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-70">
            <span class="w-12 h-12 m-2 rounded-full border-4 border-white border-b-teal-400 animate-spin"></span>
        </div>
    </div>
</template>

<style lang="css">
.fast-fade-enter-active,
.fade-enter-active {
    transition: opacity 1.0s ease-out;
}
.fade-leave-active {
  transition: opacity 1.2s ease;
}

.fast-fade-enter-from,
.fade-enter-from {
    opacity: 68;
}
.fast-fade-leave-to,
.fade-leave-to {
  opacity: 0;
}

.fast-fade-leave-active {
  transition: opacity 0.4s ease;
}

</style>