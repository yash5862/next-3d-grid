export const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()
}

export const getRandomColor = () => {
    return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}