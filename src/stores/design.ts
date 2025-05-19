import { ElementRef } from "@/components/design/Element.vue";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useSelectorStore } from "./selector";
import axios from "axios";
import { useAuthStore } from "./auth";
import { instanceOfImageRef, instanceOfShapeRef, instanceOfSpatialRef, instanceOfTextBoxRef, type BorderRef, type ImageRef, type InvalidRef, type Model, type ObjectRef, type ObjectType, type ShapeRef, type SpatialRef, type TextBoxRef } from "@/types/ObjectRef";
import type { ElementResponseDTO, ModelDTO, SlideResponseDTO } from "@/types/DTO";
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
        }).then(async res => {
            const data: SlideResponseDTO = res.data.data;
            for (const slide of data.slides.sort((a, b) => a.order - b.order)) {
                const _slide: Slide = {
                    id: slide.id,
                    hasLoaded: false,
                    thumbnail: '',
                    elements: await Promise.all(slide.slideElements.map(element => parseElement(element)))
                };
                slides.value.push(_slide);
            }

            designId.value = id;

            selectSlide(0);
            notifyChangeListeners();
        }).catch(err => {
            throw new Error('허용되지 않은 접근입니다.');
        });
    }

    function _loadSlide(slide: Slide) {
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
        }).catch(err => auth.handleCommonError(err, () => _loadSlide(slide)));
    }

    async function parseElement(dto: ElementResponseDTO): Promise<ElementRef> {
        console.log('parse', dto)
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
                const url = await loadFile(dto.content!); // TODO: when slide selected...
                objectRef = {
                    url: url,
                    borderRef: borderRef
                } as ImageRef;
                break;

            case 'SPATIAL':
                function buildModel(model: ModelDTO): Model {
                    return {
                        id: model.id,
                        name: model.name,
                        url: model.url,
                        transform: model.modelTransform,
                        shader: model.shader.toLowerCase() as 'none' | 'highlight'
                    }
                }

                objectRef = {
                    cameraMode: dto.cameraMode!.toLowerCase(),
                    cameraTransform: {
                        position: {
                            x: dto.cameraTransform!.positionX,
                            y: dto.cameraTransform!.positionY,
                            z: dto.cameraTransform!.positionZ,
                        },
                            rotation: {
                            x: dto.cameraTransform!.rotationX,
                            y: dto.cameraTransform!.rotationY,
                            z: dto.cameraTransform!.rotationZ,
                        }
                    },
                    backgroundColor: dto.backgroundColor!,
                    models: dto.models!.map(model => buildModel(model)),
                    borderRef: borderRef
                } as SpatialRef
                break;
                
            default:
                console.error("Unknown type while parsing element: ", dto.type);
                objectRef = {} as InvalidRef
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

    async function loadFile(url: string) {
        console.log('load file')
        const res = await axios.get(url, {
            responseType: 'blob'
        });

        return URL.createObjectURL(res.data);
    }


    function selectSlide(index: number) {
        if (index < 0 || index > slides.value.length - 1) return;
        selection.value = index;

        // loadSlide(currentSlide.value);
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
        if (!auth.isAuthenticated) return;

        if (index < 0 || index > slides.value.length - 1) return;
        if (slides.value.length < 2) {
            window.alert('최소 1 개의 슬라이드는 존재해야 합니다.')
            return;
        }

        axios.delete('/api/slide', {
            params: {
                userId: auth.id,
                slideId: slides.value[index].id
            },
            ...auth.config
        }).then(_res => {
            slides.value.splice(index, 1);
            selection.value = Math.min(index, slides.value.length - 1);
        }).catch(err => auth.handleCommonError(err, () => removeSlide(index)));
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
                    // file: objectRef.modelFile,
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

    async function uploadModel(element: ElementRef, model: File) {
        if (!auth.isAuthenticated) return;

        const form = new FormData();
        form.append('userId', auth.id!.toString());
        form.append('spatialId', element.id.toString());
        form.append('file', model);
        form.append('name', model.name);

        form.append('modelTransform.position.x', '0');
        form.append('modelTransform.position.y', '0');
        form.append('modelTransform.position.z', '0');
        form.append('modelTransform.rotation.x', '0');
        form.append('modelTransform.rotation.y', '0');
        form.append('modelTransform.rotation.z', '0');
        form.append('modelTransform.scale.x', '0');
        form.append('modelTransform.scale.y', '0');
        form.append('modelTransform.scale.z', '0');

        form.append('shader', 'NONE');

        return axios.post('/api/model', form, auth.config)
        .then(res => {
            return {
                id: res.data.id,
                url: res.data.url
            }
        }).catch(err => auth.handleCommonError(err, () => uploadModel(element, model)));
    }

    function updateModel(element: ElementRef, model: Model) {
        if (!auth.isAuthenticated) return;

        axios.patch('/api/model', {
            modelId: model.id,
            userId: auth.id,
            spatialId: element.id,
            name: model.name,
            modelTransform: model.transform,
            shader: model.shader.toUpperCase()
        }, auth.config)
        .then(res => {
            console.log(res);
        }).catch(err => auth.handleCommonError(err, () => updateModel(element, model)));
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

    function removeElement(id: number) {
        if (!auth.isAuthenticated) return;

        const index = currentSlide.value.elements.findIndex(element => element.id === id);
        if (index === -1) return;

        axios.delete('/api/element', {
            params: {
                userId: auth.id,
                elementId: id
            },
            ...auth.config
        }).then(_res => {
            currentSlide.value.elements.splice(index, 1);
        }).catch(err => auth.handleCommonError(err, () => removeElement(index)));

    }

    const { debounced: debouncedUpdateElement, flush: flushUpdateElement } = useDebounceFnFlushable((element) => updateElement(element), 1000);
    const { debounced: debouncedUpdateObject, flush: flushUpdateObject } = useDebounceFnFlushable((element) => updateObject(element), 1000);
    const { debounced: debouncedUpdateModel, flush: flushUpdateModel } = useDebounceFnFlushable((element, model) => updateModel(element, model), 1000);


    watch(() => selector.idSelection, () => {
        flushUpdateElement();
        flushUpdateObject();
        flushUpdateModel();
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
        addElement, updateElement, removeElement, updateObject, debouncedUpdateElement, debouncedUpdateObject, debouncedUpdateModel,
        addChangeListener, removeChangeListener,
        uploadModel, updateModel
    };
})