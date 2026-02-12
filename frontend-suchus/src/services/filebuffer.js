// src/services/fileBuffer.js
const fileBuffer = {};
export const saveFileToBuffer = (id, file) => { fileBuffer[id] = file; };
export const getFileFromBuffer = (id) => { return fileBuffer[id]; };