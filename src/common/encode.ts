export const encodeThumbnail = (blob: string) => blob ? `data:image/jpeg;base64,${blob}` : '';
