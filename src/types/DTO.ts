export interface LoginResponseDTO {
    jwtToken: string,
    refreshToken: string,
    id: number,
    name: string,
    email: string
}

export interface DesignListResponseDTO {
    id: number,
    name: string
    shared: boolean,
    inPost: boolean
    createdAt: string,
    updatedAt: string,
    thumbnail: string
}

export interface SlideResponseDTO {
    id: number,
    order: number,
    thumbnail: string,
    slideElements: ElementResponseDTO[]
}

export interface DesignResponseDTO {
    id: number,
    name: string
    shared: boolean,
    inPost: boolean,
    slideList: SlideResponseDTO[]
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

export interface PostContentDTO {
    id: number,
    userId: number,
    designId: number,
    title: string,
    content: string,
    thumbnail: string,
    username: string,
    createdAt: string,
    userEmail: string
}

export interface TemplateDTO {
    id: number,
    name: string,
    thumbnail: string
}

export interface DetailedTemplateDTO {
    id: number,
    name: string,
    thumbnail: string,
    creator: string,
    slideThumbnails: string[]
}