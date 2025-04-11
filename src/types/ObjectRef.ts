export interface ObjectRef {}

export interface ShapeRef extends ObjectRef {
    path: string,
    color: string,
    border: boolean,
    borderColor: string,
    borderThickness: number
}

export interface TextBoxRef extends ObjectRef {
    text: String,
    size: number,
    weight: number,
    align: string,
}

export interface ImageRef extends ObjectRef {
    url: string
}

export interface SpatialRef extends ObjectRef {
    model: string,
    backgroundColor: string
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