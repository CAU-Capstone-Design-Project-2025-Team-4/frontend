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