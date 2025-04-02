import { ElementRef } from "@/components/design/Element.vue";
import Vector2 from "@/types/Vector2";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface Slide {
    elements: ElementRef[]
}

export const useDesignStore = defineStore('design', () => {
    const slides = ref<Slide[]>([
        {
            elements: [
                new ElementRef(new Vector2(0, 0), 0, new Vector2(200, 200), 0, { path: 'M 50 0 A 50 50 0 1 1 49 0', color: 'oklch(0.91 0.096 180.426)' }),
                new ElementRef(new Vector2(500, 100), 0, new Vector2(200, 200), 0, { path: 'M 0 0 L 100 0 L 100 100 L 0 100 L 0 0', color: 'oklch(0.777 0.152 181.912)' }),
                new ElementRef(new Vector2(200, 200), 0, new Vector2(200, 200), 0, { text: '제목을 입력하세요.' }),
                new ElementRef(new Vector2(900, 400), 0, new Vector2(400, 200), 0, { url: 'src/assets/dog.jpg' })
            ]
        },
        {
            elements: []
        }
    ]);

    const selection = ref<number>(0);
    const currentSlide = computed<Slide>(() => slides.value[selection.value]);

    return { slides, selection, currentSlide };
})