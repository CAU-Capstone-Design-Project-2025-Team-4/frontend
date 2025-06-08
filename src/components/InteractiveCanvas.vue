<script setup lang="ts">
import { type Slide, useDesignStore } from '@/stores/design';
import Canvas from './design/Canvas.vue';
import { computed, inject, onMounted, ref, watch, type Ref } from 'vue';
import type { Animation } from '@/types/Animation';
import type UnityCanvas from './design/objects/UnityCanvas.vue';
import { useEventListener } from '@vueuse/core';

const design = useDesignStore();
const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;

const slideIndex = ref<number>(-1);

const animationIndex = ref<number>(0);
const animations = computed<Animation[]>(() => {
    return design.currentSlide.animations;
});
const animation = computed<Animation>(() => {
    return animations.value[animationIndex.value];
})

const animatedSlide = ref<Slide>();

const focus = ref<HTMLElement | null>(null);
const hasFocusOnUnity = computed<boolean>(() => focus.value?.id === 'unity-canvas');
function interact(e: PointerEvent) {
    if (hasFocusOnUnity.value) return;

    focus.value = e.target as HTMLElement;
    if (hasFocusOnUnity.value) {
        unity.value.requestPointerLock();
        unity.value.sendMessage('EnableInput', 'true');
        return;
    }

    if (animationIndex.value < animations.value.length) {        
        do {
            const element = animatedSlide.value?.elements.find(elem => animation.value.element.id === elem.id);
            switch (animation.value.effect) {
                case 'appear':
                    element!.visiblity = true;
                    break;
                case 'disappear':
                    element!.visiblity = false;
                    break;
                case 'frame_transition':
                    unity.value.sendMessage('SetCameraPositionAndRotation', JSON.stringify({
                        positionAndRotation: animation.value.frame?.cameraTransform,
                        interval: animation.value.duration
                    }));
                    break;
            }

            animationIndex.value += 1;
        } while (animationIndex.value < animations.value.length && animation.value.timing === 'with_previous');
    } else {
        if (slideIndex.value + 1 < design.slides.length) {
            slideIndex.value += 1;   
        } else {

        }
    }
}

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'q') {
        e.preventDefault();

        focus.value = null;

        document.exitPointerLock();
        unity.value.sendMessage('EnableInput', 'false');
    }
})

onMounted(() => {
    slideIndex.value = 0;
})

watch(() => slideIndex.value, () => {
    design.selectSlide(slideIndex.value);
    animatedSlide.value = { ...design.currentSlide };

    animatedSlide.value.elements.forEach(elem => {
        const firstAnimation = animations.value.find(anim => anim.element.id === elem.id);
        if (firstAnimation?.effect === 'appear') {
            elem.visiblity = false;
        }
    });
})
</script>

<template>
    <div class="relative border border-black mt-10" :style="{
        transformOrigin: `left top`,
        transform: `scale(${2/3})`,
        width: `${1920}px`,
        height: `${1080}px`
    }" @pointerup.left="interact($event)">
        <Canvas :slide="design.currentSlide" class="w-full aspect-video" />
    </div>
    <!-- <div class="relative">
    <Canvas class="w-full h-full select-none" :slide="design.slides[0]" />

    </div> -->

</template>