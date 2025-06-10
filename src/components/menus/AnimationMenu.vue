<script setup lang="ts">
import { computed, ref, useTemplateRef} from 'vue';
import Modal from '../common/Modal.vue';
import SelectBox from '../common/SelectBox.vue';
import type { Frame, Effect, Timing, Animation } from '@/types/Animation';
import { useSelectorStore } from '@/stores/selector';
import { cameraTransformToDTO, instanceOfImageRef, instanceOfShapeRef, instanceOfSpatialRef, instanceOfTextBoxRef } from '@/types/ObjectRef';
import { useDesignStore } from '@/stores/design';
import { useAuthStore } from '@/stores/auth';
import api from '@/api/api';
import type { ElementRef } from '../design/Element.vue';

const addAnimationModal = useTemplateRef<InstanceType<typeof Modal>>('add-anim-modal');
const is3dAnimation = ref<boolean>(false);
const frameList = ref<Frame[]>([]);

const effect = ref<Effect>();
const frame = ref<Frame>();
const timing = ref<Timing>();
const duration = ref<number>(0);

const auth = useAuthStore();
const selector = useSelectorStore();
const design = useDesignStore();

const isDisabled = computed<boolean>(() => selector.selection.length === 0)

function openAddAnimationModal() {
    is3dAnimation.value = false;
    if (selector.selection.length === 1) {
        if (instanceOfSpatialRef(selector.selection[0].objectRef)) {
            is3dAnimation.value = true;
            frameList.value = selector.selection[0].objectRef.frames;
        }
    }

    addAnimationModal.value?.open();
}

async function addAnimation() {
    if (!auth.isAuthenticated) return;

    for (let i = 0; i < selector.selection.length; i++) {
        await api.post('/animation', {
            userId: auth.id,
            elementId: selector.selection[i].id,
            type: effect.value?.toUpperCase(),
            duration: duration.value,
            timing: timing.value?.toUpperCase(),
            cameraTransform: cameraTransformToDTO(frame.value?.cameraTransform)
        }).then(res => {
            const animation = {
                id: res.data.data.id,
                element: selector.selection[i],
                effect: effect.value as Effect,
                timing: timing.value!,
                duration: duration.value,
            };

            if (frame.value) {
                design.currentSlide.animations.push({
                    ...animation,
                    frame: frame.value
                });
                return;
            }
            
            design.currentSlide.animations.push(animation);
        });
    }
    
    addAnimationModal.value?.close();
}

function removeAnimation(animation: Animation) {
    if (!auth.isAuthenticated) return;

    api.delete('/animation', {
        params: {
            elementId: animation.element.id,
            animationId: animation.id
        }
    }).then(_ => {
        design.currentSlide.animations = design.currentSlide.animations.filter(anim => anim.id !== animation.id);
    });
}

const elementName = (element: ElementRef) => {
    if (instanceOfShapeRef(element.objectRef)) return `모양 ${element.id}`;
    if (instanceOfImageRef(element.objectRef)) return `이미지 ${element.id}`;
    if (instanceOfTextBoxRef(element.objectRef)) return `텍스트 ${element.id}`;
    if (instanceOfSpatialRef(element.objectRef)) return `3D ${element.id}`;
    return `요소 ${element.id}`
};

const effectIcon = (effect: Effect) => {
    if (effect === 'appear') return 'i-mdi:star';
    if (effect === 'disappear') return 'i-mdi:star-outline';
    if (effect === 'frame_transition') return 'i-material-symbols:tab-move';
    return '';
}

function indexedAnimations(animations: Animation[]) {
    let index = 0;
    return animations.map(anim => {
        if (anim.timing === 'on_click') index += 1;
        return {
            index: index,
            animation: anim
        };
    });
}
</script>

<template>
    <div>
        <div class="pl-3">
            <button @click="openAddAnimationModal()" :disabled="isDisabled" class="w-full h-10 text-white leading-10 rounded-lg"
            :class="[ isDisabled ? 'bg-gray-400 cursor-auto' : 'bg-teal-500 hover:brightness-110' ]">애니메이션 추가</button>
            
            <ul class="w-full min-h-0 flex-1 mt-2 mb-1 overflow-auto">
                <li v-for="{ index, animation } in indexedAnimations(design.currentSlide.animations)" class="flex h-10 my-1.5 rounded-md">
                    <p class="w-6 h-10 leading-10" :class="{ 'i-mdi:chevron-right': animation.timing === 'after_previous' }">{{ animation.timing === 'with_previous' ? '' : index }}</p>
                    <div class="w-6 h-6 m-2" :class="effectIcon(animation.effect)" />
                    <p class="leading-10 font-light">{{ elementName(animation.element) }}</p>
                    <button class="w-6 h-6 m-2 ml-auto font-thin rounded-md hover:bg-gray-200"  @pointerup.left="removeAnimation(animation)">
                        <div class="m-1 i-mdi:window-close" />
                    </button>          
                </li>
            </ul>
        
        </div>

        <Modal ref="add-anim-modal">
            <p class="font-bold text-xl mb-8 select-none">애니메이션 추가</p>

            <template v-if="!is3dAnimation">
                <p class="mb-1 select-none">효과</p>
                <SelectBox v-model="effect" class="w-100 h-10 mb-4">
                    <li option="appear" icon="i-mdi:star">나타내기</li>
                    <li option="disappear" icon="i-mdi:star-outline">사라지기</li>
                </SelectBox>
            </template>

            <template v-else>
                <p class="mb-1 select-none">효과</p>
                <SelectBox v-model="effect" class="w-100 h-10 mb-4">
                    <li option="appear" icon="i-mdi:star">나타내기</li>
                    <li option="disappear" icon="i-mdi:star-outline">사라지기</li>
                    <li option="frame_transition" icon="i-material-symbols:tab-move">프레임 전환</li>
                </SelectBox>

                <p v-if="effect === 'frame_transition'" class="mb-1 select-none">프레임</p>
                <SelectBox v-if="effect === 'frame_transition'" v-model="frame" none="먼저 프레임을 등록해주세요" class="w-100 h-10 mb-4">
                    <li v-for="frame in frameList" :option="frame" icon="i-mdi:movie-outline">{{ frame.name }}</li>
                </SelectBox>
            </template>

            <div class="grid grid-cols-2 gap-x-4 mb-8">
                <p class="mb-1 select-none">시작</p>
                <p class="mb-1 select-none">재생 시간</p>

                <SelectBox v-model="timing" class="w-48 h-10">
                    <li option="on_click">클릭할 때</li>
                    <li option="with_previous">이전 효과와 함께</li>
                    <li option="after_previous">이전 효과 다음에</li>
                </SelectBox>
                
                <SelectBox v-model="duration" class="w-48 h-10">
                    <li option="0" icon="i-mdi:clock-check-outline">즉시</li>
                    <li option="1" v-if="effect === 'frame_transition'" icon="i-mdi:speedometer">빠르게</li>
                    <li option="3" v-if="effect === 'frame_transition'" icon="i-mdi:speedometer-medium">중간</li>
                    <li option="5" v-if="effect === 'frame_transition'" icon="i-mdi:speedometer-slow">느리게</li>
                </SelectBox>
            </div>

            <button @click="addAnimation()" :disabled="effect === 'frame_transition' && !frame" class="w-100 h-10 rounded-md"
            :class="[ effect === 'frame_transition' && !frame ? 'bg-gray-400 cursor-auto' : 'bg-teal-500 focus:brightness-110 hover:brightness-110' ]">
                <p class="text-sm text-white font-bold leading-10">선택된 요소에 애니메이션 추가</p>
            </button>
        </Modal>
    </div>
</template>