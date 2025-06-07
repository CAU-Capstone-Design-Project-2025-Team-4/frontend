import type { Frame } from "./Animation"

export interface ObjectRef {
    borderRef: BorderRef
}

export interface BorderRef {
    type: 'none' | 'solid',
    color: string,
    thickness: number
}
export interface ShapeRef extends ObjectRef {
    path: string,
    color: string,
}

export interface TextBoxRef extends ObjectRef {
    text: string,
    size: number,
    weight: number,
    fontFamily: string,
    align: 'left' | 'center' | 'right' | 'justify'
}

export interface ImageRef extends ObjectRef {
    imageFile: Blob,
    url: string,
}

export interface SpatialRef extends ObjectRef {
    cameraMode: 'free' | 'orbit',
    cameraTransform: CameraTransform,
    modelFile?: Blob | null | '',
    model?: string | null,
    models: Model[],
    backgroundColor: 'skybox' | string,
    frames: Frame[]
}

export interface CameraTransform {
    position: { x: number, y: number, z: number },
    rotation: { x: number, y: number, z: number }
}

export interface CameraTransformDTO {
    positionX: number,
    positionY: number,
    positionZ: number,
    rotationX: number,
    rotationY: number,
    rotationZ: number
}

export function cameraTransformToDTO(transform: CameraTransform) {
    return {
        positionX: transform.position.x,
        positionY: transform.position.y,
        positionZ: transform.position.z,
        rotationX: transform.rotation.x,
        rotationY: transform.rotation.y,
        rotationZ: transform.rotation.z
    }
}

export interface InvalidRef extends ObjectRef {}

export interface Model {
    id: number,
    name: string,
    url: string,
    transform: {
        position: { x: number, y: number, z: number },
        rotation: { x: number, y: number, z: number },
        scale: { x: number, y: number, z: number }
    },
    shader: 'none' | 'highlight'
}

export function instanceOfShapeRef(ref: ObjectRef): ref is ShapeRef {
    return 'path' in ref;
}

export function instanceOfTextBoxRef(ref: ObjectRef): ref is TextBoxRef {
    return 'text' in ref;
}

export function instanceOfImageRef(ref: ObjectRef): ref is ImageRef {
    return 'url' in ref;
}

export function instanceOfSpatialRef(ref: ObjectRef): ref is SpatialRef {
    return 'cameraMode' in ref;
}

export type ObjectType = 'SHAPE' | 'TEXTBOX' | 'IMAGE' | 'SPATIAL';
// export function getTypeFromRef(ref: ObjectRef): ObjectType | null {
//     if (instanceOfShapeRef(ref)) return 'SHAPE';
//     if (instanceOfTextBoxRef(ref)) return 'TEXTBOX';
//     if (instanceOfImageRef(ref)) return 'IMAGE';
//     if (instanceOfSpatialRef(ref)) return 'SPATIAL';
//     return null;
// }