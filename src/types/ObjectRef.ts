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
    cameraTransform: {
        position: { x: number, y: number, z: number },
        rotation: { x: number, y: number, z: number }
    },
    modelFile: File,
    model: string | null,
    backgroundColor: 'skybox' | string,
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
    return 'model' in ref;
}

export type ObjectType = 'SHAPE' | 'TEXTBOX' | 'IMAGE' | 'SPATIAL';
// export function getTypeFromRef(ref: ObjectRef): ObjectType | null {
//     if (instanceOfShapeRef(ref)) return 'SHAPE';
//     if (instanceOfTextBoxRef(ref)) return 'TEXTBOX';
//     if (instanceOfImageRef(ref)) return 'IMAGE';
//     if (instanceOfSpatialRef(ref)) return 'SPATIAL';
//     return null;
// }