export interface ObjectRef {}

export interface ShapeRef extends ObjectRef {
    path: string,
    color: string,
}

export interface TextBoxRef extends ObjectRef {
    text: String
}

export interface ImageRef extends ObjectRef {
    url: string
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