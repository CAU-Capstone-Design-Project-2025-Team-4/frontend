<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { computed, Fragment, getCurrentInstance, h, onMounted, ref, useTemplateRef, type VNode } from 'vue';

const selected = defineModel<any>({
    required: true
});

const props = defineProps<{
    none?: string
}>();

const node = computed<VNode>(() => {
    if (!customSlots.value.length) {
        return h('p', { class: 'text-gray-500' }, props.none);   
    }
    return customSlots.value.filter(slot => slot.value == selected.value)[0]?.vnode;
})

const { slots } = getCurrentInstance()!;
const customSlots = computed(() => {
    const raw: VNode[] = slots.default?.() || [];
    return raw
        .flatMap(vnode => {
            if (vnode.type === Fragment && Array.isArray(vnode.children)) {
                return vnode.children as VNode[];
            }
            return [vnode];
        })
        .filter(vnode => vnode.type === 'li')
        .map(vnode => {
            const icon = vnode.props?.icon;
            if (icon) {
                return h(
                    'li',
                    {
                        ...vnode.props,
                        class: 'flex items-center',
                    },
                    [
                        h('div', { class: `${icon} w-4 h-4 mr-2` }),
                        h('p', vnode.children as string),
                    ]
                );
            }
            return vnode; 
    }).map(vnode => {
        return {
            vnode: vnode,
            value: vnode.props?.option ?? null
        }
    });
})

onMounted(() => {
    if (customSlots.value.length) 
        select(customSlots.value[0]);
})

const selectBox = useTemplateRef<HTMLElement>('select-box');
const width = computed(() => selectBox.value?.getBoundingClientRect().width);

const dropdown = useTemplateRef<HTMLElement>('dropdown');
const show = ref<boolean>(false);
onClickOutside(dropdown, (e) => {
    e.stopPropagation();
    close();
})

function open() {
    if (!customSlots.value.length) return;

    show.value = true;
}

function close() {
    show.value = false;
}

function select(slot: { vnode: VNode, value: any }) {
    selected.value = slot.value;
}
</script>

<template>
    <div>
        <div ref="select-box" @pointerup.left="open()" class="flex items-center justify-between h-full px-2 select-none 
        text-sm rounded-md border border-gray-300" :class="[ { 'border-teal-500': show }, customSlots.length === 0 ? 'hover:border-gray-300' : 'hover:border-teal-500' ]">
            <component :is="node" class="list-none" :key="node" />
            <div class="i-mdi-chevron-down text-2xl" :class="{ 'bg-gray-500': customSlots.length === 0 }" />
        </div>

        <Transition>
            <ul ref="dropdown" v-if="show" class="absolute z-999 py-1.5 rounded-lg bg-white shadow-md"
            :style="{ width: `${width}px`}">
                <component v-for="slot in customSlots" :is="slot.vnode" @pointerup.left="select(slot); close()"
                class="h-10 px-3 text-sm leading-10 cursor-pointer hover:bg-gray-200" />
            </ul>
        </Transition>
    </div>

</template>

<style lang="css">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>