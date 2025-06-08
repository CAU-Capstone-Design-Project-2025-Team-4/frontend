import type { ElementRef } from "@/components/design/Element.vue";
import type { CameraTransform } from "./ObjectRef";

export type Effect = 'appear' | 'disappear' | 'frame_transition';
export type Timing = 'on_click' | 'with_previous' | 'after_previous';

export interface Frame {
    id: number,
    name: string,
    cameraTransform: CameraTransform
}

export interface Animation {
    id: number,
    element: ElementRef,
    effect: Effect,
    timing: Timing,
    duration: number,
    frame?: Frame
}