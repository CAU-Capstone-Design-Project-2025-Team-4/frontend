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
    text: String,
    size: number,
    weight: number,
    align: 'left' | 'center' | 'right' | 'justify'
}

export interface ImageRef extends ObjectRef {
    url: string,
}

export interface SpatialRef extends ObjectRef {
    cameraMode: 'free' | 'orbit',
    cameraTransform: {
        position: { x: number, y: number, z: number },
        rotation: { x: number, y: number, z: number }
    }  
    model: string | null,
    backgroundColor: 'default' | string,
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