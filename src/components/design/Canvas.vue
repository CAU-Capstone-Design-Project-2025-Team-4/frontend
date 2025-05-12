<script setup lang="ts">
import { useTemplateRef } from 'vue';
import Element, { ElementRef } from './Element.vue';
import { type Slide } from '@/stores/design';
import ContextMenu from '../common/ContextMenu.vue';
import { useSelectorStore } from '@/stores/selector';
import ObjectContext from './common/ObjectContext.vue';


const { slide } = defineProps<{
    slide: Slide | undefined
}>();

const canvas = useTemplateRef<HTMLElement>('canvas');

const selector = useSelectorStore();
const menu = useTemplateRef<InstanceType<typeof ContextMenu>>('context-menu');
function openMenu(e: MouseEvent, element: ElementRef) {
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
            <Element v-for="element in slide?.elements" :element="element" @contextmenu.prevent="openMenu($event, element)" />
        </div>

        <ContextMenu ref="context-menu">
            <ObjectContext />
        </ContextMenu>
    </div>
</template>