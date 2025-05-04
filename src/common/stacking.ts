import type { ElementRef } from "@/components/design/Element.vue";
import { useDesignStore } from "@/stores/design";
import { computed } from "vue";

export function useStackingUtils() {
    const design = useDesignStore();
    const currentSlide = design.currentSlide;

    const minZ = computed<number>(() => {
        if (currentSlide.elements.length === 0) return 0;
        return currentSlide.elements[0].z;
    });
    const maxZ = computed<number>(() => {
        if (currentSlide.elements.length === 0) return 0;
        return currentSlide.elements[currentSlide.elements.length - 1].z;
    });

    function bringForward(elements: ElementRef[]) {
        elements.sort((e, f) => f.id - e.id).forEach(element => {
            const index = currentSlide.elements.findIndex(_element => _element.id === element.id);
            if (index + 1 > currentSlide.elements.length) return;
    
            [currentSlide.elements[index].z, currentSlide.elements[index + 1].z] = [currentSlide.elements[index + 1].z, currentSlide.elements[index].z];
            [currentSlide.elements[index], currentSlide.elements[index + 1]] = [currentSlide.elements[index + 1], currentSlide.elements[index]];
        });
    }

    function bringFront(elements: ElementRef[]) {
        elements.sort((e, f) => f.id - e.id).forEach(element => {
            const index = currentSlide.elements.findIndex(_element => _element.id === element.id);
            element.z = maxZ.value + 1;

            currentSlide.elements.splice(index, 1);
            currentSlide.elements.push(element);  
        });
    }

    function sendBackward(elements: ElementRef[]) {
        elements.sort((e, f) => e.id - f.id).forEach(element => {
            const index = currentSlide.elements.findIndex(_element => _element.id === element.id);
            if (index - 1 < 0) return;

            [currentSlide.elements[index].z, currentSlide.elements[index - 1].z] = [currentSlide.elements[index - 1].z, currentSlide.elements[index].z];
            [currentSlide.elements[index], currentSlide.elements[index - 1]] = [currentSlide.elements[index - 1], currentSlide.elements[index]];
        });
    }

    function sendBack(elements: ElementRef[]) {
        elements.sort((e, f) => e.id - f.id).forEach(element => {
            const index = currentSlide.elements.findIndex(_element => _element.id === element.id);
            element.z = minZ.value - 1;

            currentSlide.elements.splice(index, 1);
            currentSlide.elements.splice(0, 0, element);
        });
    }

    return { bringForward, bringFront, sendBackward, sendBack };
}
