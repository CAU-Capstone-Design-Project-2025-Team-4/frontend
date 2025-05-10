import type { ObjectType } from "./ObjectRef"

export interface LoginResponseDTO {
    jwtToken: string,
    id: number,
    name: string,
    email: string
}

export interface DesignResponseDTO {
    id: number,
    shared: boolean,
    createdAt: string
}

export interface SlideResponseDTO {
    size: number,
    slides: [{
        id: number,
        order: number,
        slideElements: []
    }]
}

export interface BorderRefDTO {
    borderType: string,
    color: string,
    thickness: number
}
export interface ElementResponseDTO {
    id: number,
    type: string
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    angle: number,
    borderRef: BorderRefDTO,

    path?: string,
    color?: string,

    content?: string,

    text?: string,
    size?: number,
    weight?: number,
    fontFamily: string,
    textAlign: string
}