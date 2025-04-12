import { ElementRef } from "@/components/design/Element.vue";
import Vector2 from "@/types/Vector2";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useSelectorStore } from "./selector";
import type { ImageRef, ShapeRef, SpatialRef, TextBoxRef } from "@/types/ObjectRef";

export interface Slide {
    elements: ElementRef[]
}

export const useDesignStore = defineStore('design', () => {
    const selector = useSelectorStore();

    const slides = ref<Slide[]>([
        {
            elements: [
                new ElementRef(new Vector2(600, 200), 0, new Vector2(200, 200), 0, 
                { 
                    path: 'M 50 0 A 50 50 0 1 1 49.9 0', 
                    color: 'rgb(124, 23, 13)', 
                    borderRef: {
                        type: 'none',
                        color: '#000000',
                        thickness: 1
                    } 
                } as ShapeRef),

                new ElementRef(new Vector2(100, 100), 0, new Vector2(200, 200), 0, 
                { 
                    path: 'M 0 0 L 100 0 L 100 100 L 0 100 L 0 0', 
                    color: 'rgb(12, 23, 123)', 
                    borderRef: {
                        type: 'none',
                        color: '#000000',
                        thickness: 1
                    } 
                } as ShapeRef),

                new ElementRef(new Vector2(600, 300), 0, new Vector2(800, 200), 0, 
                { 
                    text: '제목을 입력하세요.', 
                    size: 72, 
                    weight: 800, 
                    align: 'center', 
                    borderRef: {
                        type: 'none',
                        color: '#000000',
                        thickness: 1
                    } 
                } as TextBoxRef),

                new ElementRef(new Vector2(1000, 500), 0, new Vector2(400, 200), 0, 
                { 
                    url: 'src/assets/dog.jpg',
                    borderRef: {
                        type: 'none',
                        color: '#000000',
                        thickness: 1
                    } 
                } as ImageRef),

                new ElementRef(new Vector2(500, 700), 0, new Vector2(400, 400), 0, { 
                    cameraMode: 'free',
                    cameraTransform: {
                        position: { x: 0, y: 0, z: -10 },
                        rotation: { x: 0, y: 0, z: 0 }
                    },
                    model: null,
                    backgroundColor: 'default',
                    borderRef: {
                        type: 'none',
                        color: '#000000',
                        thickness: 1
                    } 
                 } as SpatialRef),
            ]
        },
        {
            elements: [
                new ElementRef(new Vector2(500, 700), 0, new Vector2(400, 400), 0, { 
                    cameraMode: 'free',
                    cameraTransform: {
                        position: { x: 0, y: 0, z: -10 },
                        rotation: { x: 0, y: 0, z: 0 }
                    },
                    model: null,
                    backgroundColor: 'default',
                    borderRef: {
                        type: 'none',
                        color: '#000000',
                        thickness: 1
                    } 
                 } as SpatialRef),
            ]
        }
    ]);

    const selection = ref<number>(0);
    const currentSlide = computed<Slide>(() => slides.value[selection.value]);

    function selectSlide(index: number) {
        if (index < 0 || index > slides.value.length - 1) return;
        selection.value = index;
        selector.deselectAll();
    }

    function newSlide() {
        slides.value.push({ elements: [] });
        selectSlide(slides.value.length - 1);
    }

    function removeSlide() {
        if (selection.value < 0 || selection.value > slides.value.length - 1) return;
        if (slides.value.length < 2) return;
        slides.value.splice(selection.value, 1);
        selection.value = Math.min(selection.value, slides.value.length - 1);
    }

    function addElement(element: ElementRef) {
        currentSlide.value.elements.push(element);
    }

    function removeElement(id: number) {
        const index = currentSlide.value.elements.findIndex(element => element.id === id);
        if (index === -1) return;

        currentSlide.value.elements.splice(index, 1);
    }

    return { slides, selection, currentSlide, selectSlide, newSlide, removeSlide, addElement, removeElement };
})