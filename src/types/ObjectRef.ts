export interface ObjectRef {}

export interface ShapeRef extends ObjectRef {
    shape: String
}

export interface TextBoxRef extends ObjectRef {
    text: String
}

export function instanceOfShapeRef(ref: ObjectRef): ref is ShapeRef {
    return 'shape' in ref;
}

export function instanceOfTextBoxRef(ref: ObjectRef): ref is TextBoxRef {
    return 'text' in ref;
}