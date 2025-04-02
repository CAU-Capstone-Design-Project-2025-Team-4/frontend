import { ElementRef } from "@/components/design/Element.vue";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useSelectorStore = defineStore('selector', () => {
    const selection = ref<ElementRef[]>([]);
    const idSelection = computed<number[]>(() => selection.value.map(element => element.id));

    function isSelected(element: ElementRef) {
        return idSelection.value.includes(element.id);
    }

    function select(element: ElementRef) {
        if (isSelected(element)) return;
        selection.value.push(element);
    }

    function deselectAll() {
        selection.value.length = 0;
    }

    return { selection, isSelected, select, deselectAll };
})