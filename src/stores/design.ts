import { ElementRef } from "@/components/design/Element.vue";
import Vector2 from "@/types/Vector2";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useSelectorStore } from "./selector";
import { instanceOfSpatialRef, type ImageRef, type ShapeRef, type SpatialRef, type TextBoxRef } from "@/types/ObjectRef";
import axios from "axios";

export interface Slide {
    elements: ElementRef[] // must be sorted by z-index
}

export const useDesignStore = defineStore('design', () => {
    const selector = useSelectorStore();

    const slides = ref<Slide[]>([{
        elements: []
    }]);

    const selection = ref<number>(0);
    const currentSlide = computed<Slide>(() => slides.value[selection.value]);

    const minZ = computed<number>(() => {
        if (currentSlide.value.elements.length === 0) return 0;
        return currentSlide.value.elements[0].z;
    });
    const maxZ = computed<number>(() => {
        if (currentSlide.value.elements.length === 0) return 0;
        return currentSlide.value.elements[currentSlide.value.elements.length - 1].z;
    });

    function loadFromServer(id: number) {
        axios.get
    }

    function selectSlide(index: number) {
        if (index < 0 || index > slides.value.length - 1) return;
        selection.value = index;
        selector.deselectAll();
    }

    function newSlide() {
        slides.value.push({ elements: [] });
        selectSlide(slides.value.length - 1);
    }

    function insertSlide(index: number) {
        if (index < 0 || index > slides.value.length - 1) return;

        slides.value.splice(index + 1, 0, { elements: [] });
        selectSlide(index + 1);
    }

    function duplicateSlide(index: number) {
        if (index < 0 || index > slides.value.length - 1) return;

        const duplicated = JSON.parse(JSON.stringify(slides.value[index]));
        slides.value.splice(index, 0, duplicated);
        selectSlide(index + 1);
    }

    function removeSlide(index: number) {
        if (index < 0 || index > slides.value.length - 1) return;
        if (slides.value.length < 2) {
            window.alert('최소 1개의 슬라이드는 존재해야 합니다.')
            return;
        }

        slides.value.splice(index, 1);
        selection.value = Math.min(index, slides.value.length - 1);
    }

    function addElement(element: ElementRef) {
        element.z = maxZ.value + 1;
        currentSlide.value.elements.push(element);
    }

    function removeElement(id: number) {
        const index = currentSlide.value.elements.findIndex(element => element.id === id);
        if (index === -1) return;

        currentSlide.value.elements.splice(index, 1);
    }

    function bringForward(elements: ElementRef[]) {
        elements.sort((e, f) => f.id - e.id).forEach(element => {
            const index = currentSlide.value.elements.findIndex(_element => _element.id === element.id);
            if (index + 1 > currentSlide.value.elements.length) return;
    
            [currentSlide.value.elements[index].z, currentSlide.value.elements[index + 1].z] = [currentSlide.value.elements[index + 1].z, currentSlide.value.elements[index].z];
            [currentSlide.value.elements[index], currentSlide.value.elements[index + 1]] = [currentSlide.value.elements[index + 1], currentSlide.value.elements[index]];
        });
    }

    function bringFront(elements: ElementRef[]) {
        elements.sort((e, f) => e.id - f.id).forEach(element => {
            const index = currentSlide.value.elements.findIndex(_element => _element.id === element.id);
            element.z = maxZ.value + 1;

            currentSlide.value.elements.splice(index, 1);
            currentSlide.value.elements.push(element);  
        });
    }

    function sendBackward(elements: ElementRef[]) {
        elements.sort((e, f) => e.id - f.id).forEach(element => {
            const index = currentSlide.value.elements.findIndex(_element => _element.id === element.id);
            if (index - 1 < 0) return;

            [currentSlide.value.elements[index].z, currentSlide.value.elements[index - 1].z] = [currentSlide.value.elements[index - 1].z, currentSlide.value.elements[index].z];
            [currentSlide.value.elements[index], currentSlide.value.elements[index - 1]] = [currentSlide.value.elements[index - 1], currentSlide.value.elements[index]];
        });
    }

    function sendBack(elements: ElementRef[]) {
        elements.sort((e, f) => f.id - e.id).forEach(element => {
            const index = currentSlide.value.elements.findIndex(_element => _element.id === element.id);
            element.z = minZ.value - 1;

            currentSlide.value.elements.splice(index, 1);
            currentSlide.value.elements.splice(0, 0, element);
        });
    }

    return { 
        loadFromServer,
        slides, selection, currentSlide, 
        selectSlide, newSlide, removeSlide, insertSlide, duplicateSlide, 
        bringForward, bringFront, sendBackward, sendBack,
        addElement, removeElement 
    };
})