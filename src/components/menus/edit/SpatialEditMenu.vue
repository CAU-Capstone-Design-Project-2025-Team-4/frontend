<script lang="ts">
export const cameraModeList = {
    free: {
        icon: 'i-mdi:cursor-move',
        text: '자유 이동'
    },
    orbit: {
        icon: 'i-mdi:orbit',
        text: '궤도 회전'
    }
}
</script>

<script setup lang="ts">
import Chevron from '@/components/common/Chevron.vue';
// import Dropdown from '@/components/common/Dropdown.vue';
import TransformChevron from '@/components/design/common/TransformChevron.vue';
import type { ElementRef } from '@/components/design/Element.vue';
import { useSelectorStore } from '@/stores/selector';
import { cameraTransformToDTO, type CameraTransform, type Model, type SpatialRef } from '@/types/ObjectRef';
import { computed, inject, onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import BorderChevron from '@/components/design/common/BorderChevron.vue';
import type UnityCanvas from '@/components/design/objects/UnityCanvas.vue';
import { useDesignStore } from '@/stores/design';
import Dropdown from '@/components/common/Dropdown.vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/api/api';
import Modal from '@/components/common/Modal.vue';

const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;

const selector = useSelectorStore();

const elementRef = computed<ElementRef>(() => selector.selection[0]);
const spatialRef = computed<SpatialRef>(() => elementRef.value.objectRef as SpatialRef);

const cameraModeDropdown = useTemplateRef<InstanceType<typeof Dropdown>>('camera-mode-dropdown');
function selectMode(mode: 'free' | 'orbit') {
    spatialRef.value.cameraMode = mode;
    unity.value.sendMessage('SetCameraMode', mode);
    cameraModeDropdown.value?.close();
}

const design = useDesignStore();
async function uploadModels(e: Event) {
    const input = e.target as HTMLInputElement;
    for (const file of input.files!) {
        const _model = await design.uploadModel(elementRef.value, file);
        if (!_model) return;

        const model: Model = { 
            ..._model, 
            name: file.name,
            transform: {
                position: { x: 0, y: 0, z: 0},
                rotation: { x: 0, y: 0, z: 0},
                scale: { x: 1, y: 1, z: 1}
            },
            shader: 'none'
        };

        unity.value.sendMessage('LoadModel', JSON.stringify({
            ..._model,
            enable: true,
            properties: {
                transform: model.transform,
                shader: model.shader
            }
        }));
        
        spatialRef.value.models.push(model);
        selectedModel.value = model;
    }
}

onMounted(() => {
    if (spatialRef.value.models.length > 0) {
        selectedModel.value = spatialRef.value.models[0];
    }
})

function changeTransform() {
    // debounce?
    unity.value.sendMessage('SetCameraPositionAndRotation', JSON.stringify(spatialRef.value.cameraTransform));
}

const frameName = ref<string>('');
const captureFrameModal = useTemplateRef<InstanceType<typeof Modal>>('capture-frame-modal');

function openCaptureFrameModal() {
    frameName.value = '';
    captureFrameModal.value?.open();
}

function captureFrame() {
    if (frameName.value === '') {
        frameName.value = '이름없는 프레임'
    }

    api.post('/frame', {
        userId: auth.id,
        spatialId: elementRef.value.id,
        name: frameName.value,
        cameraTransform: cameraTransformToDTO(spatialRef.value.cameraTransform)
    }).then(_ => {
        spatialRef.value.frames.push({
            name: frameName.value,
            cameraTransform: spatialRef.value.cameraTransform
        });
        captureFrameModal.value?.close();
    });
}

watch(() => spatialRef.value.backgroundColor, () => {
    // debounce?
    const cameraBackgroudMode = spatialRef.value.backgroundColor === 'skybox' ? 'skybox' : 'solid';
    unity.value.sendMessage('SetCameraBackgroundMode', cameraBackgroudMode);
    if (cameraBackgroudMode === 'solid') {
        unity.value.sendMessage('SetCameraBackgroundColor', spatialRef.value.backgroundColor);
    }
})

const editModel = ref<boolean>(false);
const shaderDropdown = useTemplateRef<InstanceType<typeof Dropdown>>('shader-dropdown');

const selectedModel = ref<Model | null>(null);

const shaderList = {
    none: {
        name: 'none',
        icon: 'i-mdi:cancel',
        text: '없음'
    },
    highlight: {
        name: 'highlight',
        icon: 'i-mdi:lightbulb-on-outline',
        text: '하이라이트'
    }
};

const auth = useAuthStore();
function removeModel(model: Model) {
    if (!auth.isAuthenticated) return;
    
    const index = spatialRef.value.models.indexOf(model);
    if (index === -1) return;

    api.delete(`/model/${model.id}`).then(_res => {
        spatialRef.value.models.splice(index, 1);
        selectedModel.value = null;
        unity.value.sendMessage('UnloadModel', model.id);
    });
}

function selectShader(shader: 'none' | 'highlight') {
    selectedModel.value!.shader = shader;
    design.updateModel(elementRef.value, selectedModel.value!);
    unity.value.sendMessage('SetModelProperties', JSON.stringify({
        id: selectedModel.value!.id,
        properties: {
            transform: selectedModel.value!.transform,
            shader: selectedModel.value!.shader
        }
    }));

    shaderDropdown.value?.close();
}

function updateModel() {
    design.debouncedUpdateModel(elementRef.value, selectedModel.value);
    unity.value.sendMessage('SetModelProperties', JSON.stringify({
        id: selectedModel.value!.id,
        properties: {
            transform: selectedModel.value!.transform,
            shader: selectedModel.value!.shader
        }
    }));
}
</script>

<template>
    <div class="h-full flex flex-col">
        <div class="font-bold text-xl text-left p-2 mb-2">3D</div>
        <div class="px-3 flex-1 min-h-0 flex flex-col">
            <button @pointerup.left="editModel = !editModel" class="w-full h-10 p-0 rounded-lg border-0 bg-teal-500 hover:brightness-110" :style="{ outline: 'none' }">
                <p class="text-white leading-10">{{ editModel ? '장면 편집' : '모델 편집' }}</p>
            </button>

            <div v-if="editModel" class="flex-1 min-h-0 flex flex-col">
                <div v-if="selectedModel" class="grid grid-rows-[32px_32px_32px_32px_48px] grid-cols-4 gap-x-2 gap-y-1 w-full h-48 my-2">
                    <span />
                    <p class="text-left text-sm px-2 pt-1 leading-7">X</p>
                    <p class="text-left text-sm px-2 pt-1 leading-7">Y</p>
                    <p class="text-left text-sm px-2 pt-1 leading-7">Z</p>

                    <p class="text-left px-2 leading-8">위치</p>
                    <input v-model.number="selectedModel.transform.position.x" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">
                    <input v-model.number="selectedModel.transform.position.y" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">
                    <input v-model.number="selectedModel.transform.position.z" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">

                    <p class="text-left px-2 leading-8">회전</p>
                    <input v-model.number="selectedModel.transform.rotation.x" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">
                    <input v-model.number="selectedModel.transform.rotation.y" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">
                    <input v-model.number="selectedModel.transform.rotation.z" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">

                    <p class="text-left px-2 leading-8">크기</p>
                    <input v-model.number="selectedModel.transform.scale.x" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">
                    <input v-model.number="selectedModel.transform.scale.y" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">
                    <input v-model.number="selectedModel.transform.scale.z" @input="updateModel()" class="px-2 text-sm rounded-md border border-gray-400">

                    <p class="text-left px-2 mt-2 leading-10">셰이더</p>
                    <div class="relative col-span-3">
                        <div class="flex items-center h-10 p-2 mt-2 rounded-lg border border-gray-400 hover:border-teal-400" :class="{ 'border-teal-400': shaderDropdown?.show }" @pointerup.left="shaderDropdown?.open()"> 
                            <div class="mr-2" :class="shaderList[selectedModel.shader].icon" />
                            <p>{{ shaderList[selectedModel.shader].text }}</p>
                            <div class="i-mdi-chevron-down ml-auto text-2xl" />
                        </div>

                        <Dropdown ref="shader-dropdown" class="w-full">
                            <button v-for="(shader, key) in shaderList" @pointerdown.left="selectShader(key)" class="flex items-center w-full h-10 px-3 border-0 hover:bg-gray-200" :style="{ outline: 'none' }">
                                <div class="mr-2" :class="shader.icon" />
                                <p>{{ shader.text }}</p>
                            </button>
                        </Dropdown>
                    </div>
                </div>

                <p v-else class="h-48 leading-48 my-2">
                    {{ spatialRef.models.length > 0 ? '먼저 모델을 선택해주세요.' : '먼저 모델을 업로드해주세요.' }}
                </p>


                <div class="flex justify-between h-10 mt-4">
                    <p class="text-left text-lg leading-10 font-bold">모델 목록</p>

                    <input type="file" id="upload-image" accept=".glb" hidden multiple @change="uploadModels($event)" >
                    <label for="upload-image">
                        <div class="flex justify-center items-center w-40 h-10 p-0 rounded-md bg-teal-500 border-0 text-white hover:brightness-110 cursor-pointer" :style="{ outline: 'none' }">
                            <div class="w-5 h-5 mr-1 i-mdi:cloud-upload-outline"/>
                            <p>업로드</p>
                        </div>
                    </label>
                </div>
                <ul class="w-full min-h-0 flex-1 mt-2 mb-1 overflow-auto">
                    <li v-for="model in spatialRef.models" class="flex h-10 my-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                    :class="{ 'bg-gray-200 hover:bg-gray-200': selectedModel?.id === model.id }" @pointerup.left="selectedModel = model">
                        <div class="w-6 h-6 m-2 i-mdi:cube-outline"/>
                        <p class="leading-10 font-light">{{ model.name }}</p>
                        <button class="w-6 h-6 m-2 p-0 ml-auto font-thin rounded-md border-0 hover:border-1 hover:border-gray-400" 
                        :style="{ outline: 'none' }" @pointerup.left.stop="removeModel(model)">X</button>          
                    </li>
                </ul>

            </div>
            
            <div v-else>
                <p class="text-left mr-4 mt-3">조작 모드</p>
                <div class="relative">
                    <div class="flex items-center h-10 p-2 my-2 rounded-lg border border-gray-400 hover:border-teal-400" :class="{ 'border-teal-400': cameraModeDropdown?.show }" 
                    @pointerup.left="cameraModeDropdown?.open()"> 
                        <div class="mr-2" :class="cameraModeList[spatialRef.cameraMode].icon" />
                        <p ckass="text-left text-xs">{{ cameraModeList[spatialRef.cameraMode].text }}</p>
                        <div class="i-mdi-chevron-down ml-auto text-2xl" />
                    </div>

                    <Dropdown ref="camera-mode-dropdown" class="w-full">
                        <button v-for="(mode, key) in cameraModeList" @pointerdown.left="selectMode(key)" class="flex items-center w-full h-10 px-3 border-0 hover:bg-gray-200" :style="{ outline: 'none' }">
                            <div class="mr-2" :class="mode.icon" />
                            <p>{{ mode.text }}</p>
                        </button>
                    </Dropdown>
                </div>
                

                <Chevron :title="'카메라'" class="my-2">
                    <div class="grid grid-rows-3 grid-cols-4 gap-x-2 py-2">
                        <span />
                        <p class="text-left p-1 leading-8">X</p>
                        <p class="text-left p-1 leading-8">Y</p>
                        <p class="text-left p-1 leading-8">Z</p>

                        <p class="text-left p-1 leading-8">위치</p>
                        <form @submit.prevent="" class="relative mb-2">
                            <input v-model.number="spatialRef.cameraTransform.position.x" @input="changeTransform()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" />
                        </form>
                        <form @submit.prevent="" class="relative">
                            <input v-model.number="spatialRef.cameraTransform.position.y" @input="changeTransform()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" /> 
                        </form>
                        <form @submit.prevent="" class="relative">
                            <input v-model.number="spatialRef.cameraTransform.position.z" @input="changeTransform()" class="block w-full h-10 pr-6 px-2 text-sm border border-slate-400 rounded-md" /> 
                        </form>

                        <p class="text-left p-1 leading-8">회전</p>
                        <form @submit.prevent="" class="relative">
                            <input v-model.number="spatialRef.cameraTransform.rotation.x" @input="changeTransform()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" />
                        </form>
                        <form @submit.prevent="" class="relative">
                            <input v-model.number="spatialRef.cameraTransform.rotation.y" @input="changeTransform()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" /> 
                        </form>
                        <form @submit.prevent="" class="relative">
                            <input v-model.number="spatialRef.cameraTransform.rotation.z" @input="changeTransform()" class="block w-full h-10 pr-6 px-2 text-sm border border-slate-400 rounded-md" /> 
                        </form>
                    </div>
                </Chevron>
                <Chevron :title="'배경 색'" class="my-2">
                    <div>
                        <div class="flex items-center w-full h-8 rounded-md hover:bg-slate-50" @pointerdown="spatialRef.backgroundColor = 'skybox'">
                            <div class="w-4 h-4 mr-2 rounded-full border border-slate-400"
                            :class="{ 'border-3 border-teal-400 outline outline-solid outline-teal-400' : spatialRef.backgroundColor === 'skybox' }"></div>
                            <p>기본</p>
                        </div>
                        <div class="flex items-center w-full h-8 rounded-md hover:bg-slate-50" @pointerdown="spatialRef.backgroundColor = '#000000'">
                            <div class="w-4 h-4 mr-2 rounded-full border border-slate-400"
                            :class="{ 'border-3 border-teal-400 outline outline-solid outline-teal-400' : spatialRef.backgroundColor !== 'skybox' }"></div>
                            <p>단색</p>
                        </div>
                        <div v-if="spatialRef.backgroundColor !== 'skybox'" class="mt-2 border-t border-slate-200">
                            <div class="flex items-center justify-between w-full h-8 mt-2">
                                <p class="text-left">색</p>
                                <ColorPicker v-model="spatialRef.backgroundColor" class="w-8 h-8 mr-1 rounded-lg border border-slate-400"
                                :style="{ backgroundColor: spatialRef.backgroundColor }" />
                            </div>
                        </div>
                    </div>
                </Chevron>
                <BorderChevron class="my-2" :element="elementRef" />
                <TransformChevron :element="elementRef" />

                <div class="flex justify-between h-10 mt-12">
                    <p class="text-left text-lg leading-10 font-bold">프레임 목록</p>

                    <button @pointerup.left="openCaptureFrameModal()" class="flex justify-center items-center w-40 h-10 text-white rounded-md bg-teal-500 hover:brightness-110">
                        <div class="w-5 h-5 mr-1 i-mdi:camera-enhance"/>
                        <p>캡처</p>
                    </button>

                    <Modal ref="capture-frame-modal">
                        <p class="font-bold text-xl mb-8 select-none">프레임 캡처</p>
                        <form @submit.prevent="captureFrame()">
                            <div class="relative w-80 mb-4">
                                <p class="mb-1 select-none">이름</p>
                                <input v-model="frameName"  placeholder="프레임 이름을 입력해주세요." 
                                class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300 outline-teal-500 hover:border-teal-500" />
                            </div>

                            <button type="submit" class="w-80 h-10 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
                                <p class="text-sm text-white font-bold leading-10">캡처</p>
                            </button>
                        </form>

                    </Modal>
                </div>
                <ul class="w-full min-h-40 flex-1 mt-2 mb-1 overflow-auto">
                    <li v-for="frame in spatialRef.frames" class="flex h-10 my-1.5 rounded-md">
                        <div class="w-6 h-6 m-2 i-mdi:movie-outline" />
                        <p class="leading-10 font-light">{{ frame.name }}</p>
                        <!-- <button class="w-6 h-6 m-2 ml-auto font-thin rounded-md hover:bg-gray-200"  @pointerup.left="removeAnimation(animation)">X</button>           -->
                    </li>
                </ul>
            </div>
            <!-- <p class="text-left">카메라 모드</p>
            <div class="flex items-center w-full h-10 p-2 rounded-lg border border-gray-400 hover:border-teal-400 my-2" @pointerdown.stop="openDropdown()"> 
                <div class="mr-2" :class="cameraModeList[spatialRef.cameraMode].icon" />
                <p ckass="text-left text-xs">{{ cameraModeList[spatialRef.cameraMode].text }}</p>
                <div class="i-mdi-chevron-down ml-auto text-2xl" />
            </div>

            <div class="relative">
                <div ref="dropdown" v-if="showDropdown" class="absolute w-full h-fit z-10000 my-1 py-1 rounded-lg bg-white shadow-lg">
                    <div v-for="(value, mode) in cameraModeList" class="flex items-center w-full h-10 p-2 hover:bg-gray-100" 
                    :class="{ 'bg-gray-100': spatialRef.cameraMode === mode }" @pointerdown="selectMode(mode)">
                        <div class="mr-2" :class="value.icon" />
                        <p ckass="text-left text-xs">{{ value.text }}</p>
                    </div>
                </div>
            </div> -->
            
            <!-- <Dropdown ref="dropdown" v-if="show" class="w-full h-fit z-100 my-1 py-1">
                <div v-for="(value, mode) in cameraModeList" class="flex items-center w-full h-10 p-2 hover:bg-gray-100" 
                :class="{ 'bg-gray-100': spatialRef.cameraMode === mode }" @pointerdown="selectMode(mode)">
                    <div class="mr-2" :class="value.icon" />
                    <p ckass="text-left text-xs">{{ value.text }}</p>
                </div>
            </Dropdown>  -->

            <!-- <Chevron :title="'3D 모델'" class="my-2">
                <input type="file" id="upload-image" accept=".glb" hidden multiple @change="uploadModels($event)" >
                <label for="upload-image">
                    <div class="w-full h-10 my-2 rounded-lg bg-teal-500 hover:bg-teal-600">
                        <p class="text-white leading-10">모델 업로드</p>
                    </div>
                </label>

                <div class="flex w-full h-10 mb-2">
                    <div class="i-mdi:chevron-left h-full mr-2 leading-10" />
                    <div class="w-3/10 border-b-3 border-teal-400">
                        <p class="text-sm px-1 leading-10">전체</p>
                    </div>
                    <div class="w-3/10 border-b-2 border-gray-200">
                        <p class="text-sm px-1 leading-10">기본 도형</p>
                    </div>
                    <div class="w-3/10 border-b-2 border-gray-200">
                        <p class="text-sm px-1 leading-10">기계 장치</p>
                    </div>
                    <div class="i-mdi:chevron-right h-full ml-2 leading-10" />
                </div>
                <div class="grid grid-rows-3 grid-flow-col gap-2 w-full py-2 overflow-x-auto">
                    <div v-for="_ in 18" class="min-w-16 min-h-16 rounded-xl bg-slate-200" />
                </div>
            </Chevron> -->

            
        </div>
    </div>

</template>