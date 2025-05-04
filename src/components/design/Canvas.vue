<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import Element, { ElementRef } from './Element.vue';
import { type Slide } from '@/stores/design';
import ContextMenu from '../common/ContextMenu.vue';
import { useSelectorStore } from '@/stores/selector';
import ObjectContext from './common/ObjectContext.vue';


const { slide } = defineProps<{
    slide: Slide
}>();

const canvas = useTemplateRef<HTMLElement>('canvas');
const handleable = inject<boolean>('handleable', false);



let _width = ref<number>(0);
const ratio = computed<number>(() => {
    if (handleable) return 1;
    return _width.value / 1920;
});

let observer: ResizeObserver;
onMounted(() => {
    observer = new ResizeObserver(_ => {
        _width.value = canvas.value!.clientWidth;
    });
    observer.observe(canvas.value!);
})

onBeforeUnmount(() => observer.disconnect());

const selector = useSelectorStore();
const menu = useTemplateRef<InstanceType<typeof ContextMenu>>('context-menu');
function openMenu(e: MouseEvent, element: ElementRef) {
    if (!handleable) return;

    if (!e.ctrlKey) {
        selector.deselectAll();
    }
    selector.select(element);

    menu.value?.open(e);
}
</script>

<template>
    <div>
        <div ref="canvas" class="absolute w-full h-full overflow-hidden" :style="{backgroundColor: 'white'}">
            <Element v-for="element in slide?.elements" :element="element" :ratio="ratio" @contextmenu.prevent="openMenu($event, element)" />
        </div>

        <ContextMenu ref="context-menu">
            <ObjectContext />
        </ContextMenu>
    </div>
</template>