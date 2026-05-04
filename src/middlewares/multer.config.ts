import multer from 'multer';

// Le decimos a Multer que guarde los archivos en la memoria RAM temporalmente
const storage = multer.memoryStorage();

// Creamos al "guardia" con un límite de peso de 100MB
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  }
});