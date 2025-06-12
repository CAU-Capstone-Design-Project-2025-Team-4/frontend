import { ElementRef } from "@/components/design/Element.vue";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useSelectorStore } from "./selector";
import { useAuthStore } from "./auth";
import { cameraTransformToDTO, dtoToCameraTransform, instanceOfImageRef, instanceOfShapeRef, instanceOfSpatialRef, instanceOfTextBoxRef, type BorderRef, type ImageRef, type InvalidRef, type Model, type ObjectRef, type ObjectType, type ShapeRef, type SpatialRef, type TextBoxRef } from "@/types/ObjectRef";
import type { AnimationResponseDTO, DesignResponseDTO, ElementResponseDTO, FrameResponseDTO, ModelDTO } from "@/types/DTO";
import Vector2 from "@/types/Vector2";
import { useDebounceFnFlushable } from "@/common/debounce";
import api from "@/api/api";
import axios from "axios";
import type { Animation, Effect, Frame, Timing } from "@/types/Animation";
import { encodeThumbnail } from "@/common/encode";

export interface Slide {
    id: number,
    thumbnail?: string,
    elements: ElementRef[], // must be sorted by z-index
    animations: Animation[]
}

function _newSlide(_id?: number): Slide {
    return { id: _id ?? 0, thumbnail: '', elements: [], animations: [] };
}

export const useDesignStore = defineStore('design', () => {
    const selector = useSelectorStore();
    const auth = useAuthStore();

    const designId = ref<number>(-1);
    const designTitle = ref<string>('');

    const slides = ref<Slide[]>([]);

    const selection = ref<number>(0);
    const currentSlide = computed<Slide>(() => slides.value[selection.value]);

    const shared = ref<boolean>(false);
    const inPost = ref<boolean>(false);

    const maxZ = computed<number>(() => {
        if (currentSlide.value.elements.length === 0) return 0;
        return currentSlide.value.elements[currentSlide.value.elements.length - 1].z;
    });

    function $reset() {
        slides.value.length = 0;
        selection.value = 0;
    }

    async function load(id: number): Promise<string> {
        $reset();

        return api.get(`/design/${id}`).then(async res => {
            const data: DesignResponseDTO = res.data.data;

            for (const slide of data.slideList.sort((a, b) => a.order - b.order)) {
                const elements = (await Promise.all(slide.slideElements.map(element => parseElement(element)))).sort((a, b) => a.z - b.z);
                const _slide: Slide = {
                    id: slide.id,
                    thumbnail: encodeThumbnail(slide.thumbnail),
                    elements: elements,
                    animations: await loadAnimation(slide.id, elements)
                };
                slides.value.push(_slide);
            }

            designId.value = id;
            designTitle.value = data.name;

            shared.value = data.shared;
            inPost.value = data.inPost;

            selectSlide(0);
            notifyChangeListeners();

            return data.name;
        });
    }

    async function loadAnimation(id: number, elements: ElementRef[]): Promise<Animation[]> {
        const animations: AnimationResponseDTO[] = await api.get('/animation', {
            params: {
                slideId: id
            }
        }).then(res => res.data.data);

        return animations.map(anim => {
            let frame = {};
            if (anim.cameraTransform) {
                frame = {
                    frame: {
                        name: '',
                        cameraTransform: dtoToCameraTransform(anim.cameraTransform)
                    }
                };
            }

            return {
                id: anim.id,
                element: elements.find(elem => elem.id === anim.elementId)!,
                effect: anim.type.toLowerCase() as Effect,
                duration: anim.duration,
                timing: anim.timing.toLowerCase() as Timing,
                ...frame
            }
        }).sort((a, b) => a.id - b.id);
    }

    async function parseElement(dto: ElementResponseDTO): Promise<ElementRef> {
        // console.log('parse', dto)
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
                    align: dto.textAlign?.toLowerCase(),
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

                const frames: Frame[] = await api.get('/frame/all', {
                    params: {
                        spatialId: dto.id
                    }
                }).then(res => {
                    const frames: FrameResponseDTO[] = res.data.data;
                    return frames.map(frame => {
                        return {
                            id: frame.frameId,
                            name: frame.name,
                            cameraTransform: dtoToCameraTransform(frame.cameraTransform)
                        }
                    });
                });

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
                    frames: frames,
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

        api.post('/slide', {
            userId: auth.id,
            designId: designId.value,
            order: slides.value.length,
        }).then(res => {
            const id = res.data.data.id;

            slides.value.push(_newSlide(id));
            selectSlide(slides.value.length - 1);

            notifyChangeListeners();
        });
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

        api.delete('/slide', {
            params: {
                userId: auth.id,
                slideId: slides.value[index].id
            }
        }).then(_res => {
            slides.value.splice(index, 1);
            selection.value = Math.min(index, slides.value.length - 1);
        });
    }

    function updateSlideThumbnail(image: Blob) {
        if (!auth.isAuthenticated) return;
        if (!currentSlide.value) return;

        const form = new FormData();
        form.append('userId', `${auth.id}`);
        form.append('designId', `${designId.value}`);
        form.append('image', image);

        if (currentSlide.value.id === slides.value[0].id) {
            api.patch('/design/thumbnail', form);
        }

        form.append('slideId', `${currentSlide.value.id}`);

        api.patch('/slide/thumbnail', form).then(_ => {
            currentSlide.value.thumbnail = URL.createObjectURL(image);
        });
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

        api.post('/element/' + type.toLowerCase(), data)
        .then(res => {
            const id = res.data.data.id;
                element.id = id;
                currentSlide.value.elements.push(element);

                notifyChangeListeners();
        });
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
        form.append('modelTransform.scale.x', '1');
        form.append('modelTransform.scale.y', '1');
        form.append('modelTransform.scale.z', '1');

        form.append('shader', 'NONE');

        return api.post('/model', form)
        .then(res => {
            return {
                id: res.data.data.id,
                url: res.data.data.url
            }
        });
    }

    function updateModel(element: ElementRef, model: Model) {
        if (!auth.isAuthenticated) return;

        api.patch('/model', {
            modelId: model.id,
            userId: auth.id,
            spatialId: element.id,
            name: model.name,
            modelTransform: model.transform,
            shader: model.shader.toUpperCase()
        })
        .then(_res => {
            return true;
        });
    }
    

    function updateElement(element: ElementRef) {
        if (!auth.isAuthenticated) return;

        api.patch('/element', {
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
        }).then(_ => notifyChangeListeners());
    }

    function updateObject(element: ElementRef) {
        const objectRef = element.objectRef;
        const common = {
            userId: auth.id,
            elementId: element.id,
        };

        let { type, data } = buildParamsFrom(objectRef, common);
        if (!type) return;
        if (type === 'SPATIAL' && instanceOfSpatialRef(objectRef)) {
            data = {
                userId: auth.id,
                elementId: element.id,
                cameraMode: objectRef.cameraMode.toUpperCase(),
                backgroundColor: objectRef.backgroundColor,
                cameraTransform: cameraTransformToDTO(objectRef.cameraTransform)
            }
        }

        api.patch('/element/' + type?.toLowerCase(), data).then(_ => notifyChangeListeners());
    }

    async function removeElement(id: number) {
        if (!auth.isAuthenticated) return;

        const index = currentSlide.value.elements.findIndex(element => element.id === id);
        if (index === -1) return;

        await api.delete('/element', {
            params: {
                userId: auth.id,
                elementId: id
            }
        });

        currentSlide.value.elements.splice(index, 1);
        notifyChangeListeners();
            
        const currentSlideId = currentSlide.value.id;
        const animations = await loadAnimation(currentSlideId, currentSlide.value.elements);
        
        const slide = slides.value.find(slide => slide.id === currentSlideId);
        if (slide) {
            slide.animations = animations;
        }
    }

    function share(title: string, description: string) {
        if (!auth.isAuthenticated) return;

        api.post('/post', {
            userId: auth.id,
            designId: designId.value,
            title: title,
            content: description.replace(/\n/g, '<br>')
        }).then(_ => {
            inPost.value = true;
            window.alert("게시글을 작성했습니다.");
        });
    }

    function shareTemplate() {
        if (!auth.isAuthenticated) return;

        api.post('/design/share', {
            userId: auth.id,
            designId: designId.value,
            flag: true
        }).then(_ => {
            shared.value = true;
            window.alert("템플릿이 공유되었습니다.");
        });
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

    function updateTitle(title: string) {
        if (!auth.isAuthenticated) return;

        api.patch('/design/name', {
            userId: auth.id,
            designId: designId.value,
            name: title
        });
    }

    return { 
        load, designId,
        slides, selection, currentSlide, 
        selectSlide, addSlide, removeSlide, insertSlide, duplicateSlide, 
        addElement, updateElement, removeElement, updateObject, debouncedUpdateElement, debouncedUpdateObject, debouncedUpdateModel,
        addChangeListener, removeChangeListener, notifyChangeListeners,
        uploadModel, updateModel,
        share, shareTemplate, updateTitle, updateSlideThumbnail,
        shared, inPost
    };
})