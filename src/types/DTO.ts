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

export interface BorderRefDTO {
    borderType: string,
    color: string,
    thickness: number
}
export interface ElementResponseDTO {
    id: number,
    type: string,
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
}