export interface ObjectRef {}

export interface ShapeRef extends ObjectRef {
    path: string,
    color: string,
}

export interface TextBoxRef extends ObjectRef {
    text: String
}

export function instanceOfShapeRef(ref: ObjectRef): ref is ShapeRef {
    return 'path' in ref;
}

export function instanceOfTextBoxRef(ref: ObjectRef): ref is TextBoxRef {
    return 'text' in ref;
}