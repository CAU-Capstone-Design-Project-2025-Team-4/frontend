import { ElementRef } from "@/components/design/Element.vue";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useSelectorStore } from "./selector";
import axios from "axios";
import { useAuthStore } from "./auth";
import { instanceOfImageRef, instanceOfShapeRef, instanceOfSpatialRef, instanceOfTextBoxRef, type BorderRef, type ImageRef, type ObjectRef, type ObjectType, type ShapeRef, type SpatialRef, type TextBoxRef } from "@/types/ObjectRef";
import type { ElementResponseDTO, SlideResponseDTO } from "@/types/DTO";
import Vector2 from "@/types/Vector2";
import { useDebounceFnFlushable } from "@/common/debounce";
import { rand } from "@vueuse/core";

export interface Slide {
    id: number,
    hasLoaded: boolean,
    thumbnail?: string,
    elements: ElementRef[] // must be sorted by z-index
}

function _newSlide(_id?: number): Slide {
    return { id: _id ?? 0, hasLoaded: false, thumbnail: '', elements: [] };
}

export const useDesignStore = defineStore('design', () => {
    const selector = useSelectorStore();
    const auth = useAuthStore();

    const designId = ref<number>(-1);

    const slides = ref<Slide[]>([]);

    const selection = ref<number>(0);
    const currentSlide = computed<Slide>(() => slides.value[selection.value]);

    const maxZ = computed<number>(() => {
        if (currentSlide.value.elements.length === 0) return 0;
        return currentSlide.value.elements[currentSlide.value.elements.length - 1].z;
    });

    function $reset() {
        slides.value.length = 0;
        selection.value = 0;
    }

    async function load(id: number) {
        if (!auth.isAuthenticated) throw new Error('먼저 로그인해주세요.');

        $reset();
        
        axios.get('/api/slide', {
            params: {
                userId: auth.id,
                designId: id
            },
            ...auth.config
        }).then(res => {
            const data: SlideResponseDTO = res.data.data;
            data.slides.forEach(slide => {
                slides.value.push(_newSlide(slide.id));
            });
            designId.value = id;

            selectSlide(0);
            notifyChangeListeners();
        }).catch(err => {
            throw new Error('허용되지 않은 접근입니다.');
        });
    }

    function loadSlide(slide: Slide) {
        if (slide.hasLoaded) return;
        if (!auth.isAuthenticated) return;
         
        axios.get('/api/element', {
            params: {
                userId: auth.id,
                slideId: slide.id
            },
            ...auth.config
        }).then(async (res) => {
            const elements: ElementResponseDTO[] = res.data.data;

            const promises = elements.map(async (elementDto) => {
                const element = await parseElement(elementDto);
                if (element) {
                    currentSlide.value.elements.push(element);
                }
            });

            await Promise.all(promises);

            slide.hasLoaded = true;
            notifyChangeListeners();
        }).catch(err => auth.handleCommonError(err, () => loadSlide(slide)));
    }

    async function parseElement(dto: ElementResponseDTO): Promise<ElementRef | null> {
        const borderRef: BorderRef = {
            type: dto.borderRef.borderType.toLowerCase() as 'none' | 'solid',
            color: dto.borderRef.color,
            thickness: dto.borderRef.thickness
        };

        let objectRef: ObjectRef;
        switch (dto.type) {
            case 'SHAPE':
                objectRef = { 
                    path: dto.path!, 
                    color: dto.color!, 
                    borderRef: borderRef 
                } as ShapeRef;
                break;

            case 'TEXT_BOX':
                objectRef = {
                    text: dto.text!,
                    size: dto.size!,
                    weight: dto.weight!,
                    fontFamily: dto.fontFamily!,
                    align: dto.textAlign!.toLowerCase(),
                    borderRef: borderRef
                } as TextBoxRef
                break;

            case 'IMAGE':
                const url = await loadFile(dto.id);
                objectRef = {
                    url: url,
                    borderRef: borderRef
                } as ImageRef;
                break;
                
            default:
                console.error("Unknown type while parsing element: ", dto.type);
                return null;
        }

        return new ElementRef(
            dto.id,
            new Vector2(dto.x, dto.y),
            dto.angle,
            new Vector2(dto.width, dto.height),
            dto.z,
            objectRef
        );
    }

    async function loadFile(id: number) {
        const res = await fetch(`/api/element/file/${id}`, {
            method: 'GET',
            ...Object(auth.config),
        });

        return URL.createObjectURL(await res.blob());
    }


    function selectSlide(index: number) {
        if (index < 0 || index > slides.value.length - 1) return;
        selection.value = index;

        loadSlide(currentSlide.value);
        selector.deselectAll();
    }

    function addSlide() {
        if (!auth.isAuthenticated) return;

        axios.post('/api/slide', {
            userId: auth.id,
            designId: designId.value,
            order: slides.value.length,
        }, auth.config).then(res => {
            const id = res.data.data.id;
            slides.value.push(_newSlide(id));
            selectSlide(slides.value.length - 1);
        }).catch(err => auth.handleCommonError(err, () => addSlide()));

        notifyChangeListeners();
    }

    function insertSlide(index: number) {
        if (index < 0 || index > slides.value.length - 1) return;

        slides.value.splice(index + 1, 0, _newSlide());
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
            window.alert('최소 1 개의 슬라이드는 존재해야 합니다.')
            return;
        }

        slides.value.splice(index, 1);
        selection.value = Math.min(index, slides.value.length - 1);
    }


    

    function buildParamsFrom(objectRef: ObjectRef, common: object): { type: ObjectType | null, data: object | FormData | undefined } {
        function buildFormData(dto: object): FormData {
            const formData = new FormData();
            for (const [key, value] of Object.entries(dto)) {
                formData.append(key, value);
            }
            return formData;
        }

        if (instanceOfShapeRef(objectRef)) {
            return {
                type: 'SHAPE',
                data: {
                    ...common,
                    path: objectRef.path,
                    color: objectRef.color
                }
            }
        }
            
        if (instanceOfTextBoxRef(objectRef)) {
            return {
                type: 'TEXTBOX',
                data: {
                    ...common,
                    ...objectRef,
                    text: objectRef.text,
                    size: objectRef.size,
                    weight: objectRef.weight,
                    fontFamily : objectRef.fontFamily,
                    textAlign : objectRef.align.toUpperCase()
                }
            }
        }

        if (instanceOfImageRef(objectRef)) {
            console.log(objectRef.imageFile)
            return {
                type: 'IMAGE',
                data: buildFormData({
                    ...common,
                    image: objectRef.imageFile,
                })
            }
        } 
        if (instanceOfSpatialRef(objectRef)) {
            return {
                type: 'SPATIAL',
                data: buildFormData({
                    ...common,
                    file: objectRef.modelFile,
                    'cameraTransform.positionX': objectRef.cameraTransform.position.x,
                    'cameraTransform.positionY': objectRef.cameraTransform.position.y,
                    'cameraTransform.positionZ': objectRef.cameraTransform.position.z,
                    'cameraTransform.rotationX': objectRef.cameraTransform.rotation.x,
                    'cameraTransform.rotationY': objectRef.cameraTransform.rotation.y,
                    'cameraTransform.rotationZ': objectRef.cameraTransform.rotation.z,
                    backgroundColor: objectRef.backgroundColor,
                    cameraMode: objectRef.cameraMode.toUpperCase()
                })
            }   
        } 

        console.error('Unexpected objectRef: ', objectRef);
        return { type: null, data: undefined };
    }


    function addElement(element: ElementRef) {
        if (!auth.isAuthenticated) return;
        
        element.z = maxZ.value + 1;

        const objectRef = element.objectRef;
        const common = {
            userId: auth.id,
            slideId: currentSlide.value.id,
        
            borderType: objectRef.borderRef.type.toUpperCase(),
            borderColor: objectRef.borderRef.color,
            borderThickness: objectRef.borderRef.thickness,
            
            x: element.position.x,
            y: element.position.y,
            z: element.z,
            
            angle: element.rotation,
            width: element.size.x,
            height: element.size.y,
        }

        const { type, data } = buildParamsFrom(objectRef, common);
        if (!type) return;

        axios.post('/api/element/' + type.toLowerCase(), data, auth.config)
        .then(res => {
            const id = res.data.data.id;
                element.id = id;
                currentSlide.value.elements.push(element);

                notifyChangeListeners();
        }).catch(err => auth.handleCommonError(err, () => addElement(element)));
    }

    function _addElement(element: ElementRef) {
        element.id = rand(0, 888888);
        currentSlide.value.elements.push(element);

        notifyChangeListeners();
    }

    async function uploadModel(element: ElementRef, model: Blob) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            id: rand(0, 98999999),
            url: "http://localhost:5173/UFO_Empty.glb"
        };
    }
    

    function updateElement(element: ElementRef) {
        if (!auth.isAuthenticated) return;

        axios.patch('/api/element', {
            userId: auth.id,
            elementId: element.id,
            x: element.position.x,
            y: element.position.y,
            angle: element.rotation,
            width: element.size.x,
            height: element.size.y,
            z: element.z,
            borderType: element.objectRef.borderRef.type.toUpperCase(),
            borderColor: element.objectRef.borderRef.color,
            borderThickness: element.objectRef.borderRef.thickness
        }, auth.config).then(res => {
            console.log(res);
        }).catch(err => auth.handleCommonError(err, () => updateElement(element)));

        notifyChangeListeners();
    }

    function updateObject(element: ElementRef) {
        const objectRef = element.objectRef;
        const common = {
            userId: auth.id,
            elementId: element.id,
        };

        const { type, data } = buildParamsFrom(objectRef, common);
        if (!type) return;

        axios.patch('/api/element/' + type?.toLowerCase(), data, auth.config)
        .then(res => {
            console.log(res);
        }).catch(err => auth.handleCommonError(err, () => updateObject(element)));

        notifyChangeListeners();
    }

    // TODO
    function removeElement(id: number) {
        const index = currentSlide.value.elements.findIndex(element => element.id === id);
        if (index === -1) return;

        currentSlide.value.elements.splice(index, 1);
    }

    const { debounced: debouncedUpdateElement, flush: flushUpdateElement } = useDebounceFnFlushable((element) => updateElement(element), 1000);
    const { debounced: debouncedUpdateObject, flush: flushUpdateObject } = useDebounceFnFlushable((element) => updateObject(element), 1000);

    watch(() => selector.idSelection, () => {
        flushUpdateElement();
        flushUpdateObject();
    })


    let listeners: (() => void)[] = [];
    function addChangeListener(listener: () => void) {
        listeners.push(listener)
    }
    function removeChangeListener(listener: () => void) {
        listeners = listeners.filter(_listener => _listener !== listener);
    }
    function notifyChangeListeners() {
        listeners.forEach(listener => listener());
    }

    return { 
        load,
        slides, selection, currentSlide, 
        selectSlide, addSlide, removeSlide, insertSlide, duplicateSlide, 
        addElement, updateElement, removeElement, updateObject, debouncedUpdateElement, debouncedUpdateObject,
        addChangeListener, removeChangeListener,
        _addElement, uploadModel
    };
})