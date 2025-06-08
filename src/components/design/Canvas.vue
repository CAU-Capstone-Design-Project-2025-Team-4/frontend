<script setup lang="ts">
import { inject, provide, ref, useTemplateRef, type Ref } from 'vue';
import Element, { ElementRef } from './Element.vue';
import { type Slide } from '@/stores/design';
import ContextMenu from '../common/ContextMenu.vue';
import { useSelectorStore } from '@/stores/selector';
import ObjectContext from './common/ObjectContext.vue';
import type UnityCanvas from './objects/UnityCanvas.vue';


const props = withDefaults(
  defineProps<{
    slide?: Slide
    handleable?: boolean
  }>(),
  {
    handleable: false
  }
);

const canvas = useTemplateRef<HTMLElement>('canvas');

const selector = useSelectorStore();
const menu = useTemplateRef<InstanceType<typeof ContextMenu>>('context-menu');
function openMenu(e: MouseEvent, element: ElementRef) {
    if (!props.handleable) return;

    if (!e.ctrlKey) {
        selector.deselectAll();
    }
    selector.select(element);

    menu.value?.open(e);
}

provide<boolean>('handleable', props.handleable);

const refreshKey = ref<number>(0);
const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;
unity.value.setInstantiatedListener(() => refreshKey.value++);
</script>

<template>
    <div :key="refreshKey">
        <div ref="canvas" class="absolute w-full h-full overflow-hidden" :style="{backgroundColor: 'white'}">
            <Element v-for="element in props.slide?.elements" :element="element" @contextmenu.prevent="openMenu($event, element)" />
        </div>

        <ContextMenu ref="context-menu">
            <ObjectContext />
        </ContextMenu>
    </div>
</template>