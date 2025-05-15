export interface LoginResponseDTO {
    jwtToken: string,
    refreshToken: string,
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
        slideElements: ElementResponseDTO[]
    }]
}

export interface BorderRefDTO {
    borderType: string,
    color: string,
    thickness: number
}

export interface ModelDTO {
    id: number,
    url: string,
    name: string,
    modelTransform: {
        position: { x: number, y: number, z: number },
        rotation: { x: number, y: number, z: number },
        scale: { x: number, y: number, z: number }
    },
    shader: string
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
    textAlign: string,

    cameraMode?: string,
    cameraTransform?: {
        positionX: number,
        positionY: number,
        positionZ: number,
        rotationX: number,
        rotationY: number,
        rotationZ: number
    },
    models?: ModelDTO[],
    backgroundColor?: string,
}

export interface AddModelResponseDTO {
    id: number,
    url: string
}