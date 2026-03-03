import { Router } from 'express';
// 1. Cambiamos el nombre del import a "MovieController" (porque es el objeto completo)
import MovieController from '../controllers/movie.controller';
import multer from 'multer';

const routerMovie = Router();

// --- The routes ---

routerMovie.get('/', MovieController.getAllMovies);

routerMovie.get('/:id',MovieController.getMovieById);

// Nouvelles routes d'administration
routerMovie.patch('/:id/status', MovieController.updateMovieStatus);
routerMovie.delete('/:id', MovieController.deleteMovie);

const storage = multer.memoryStorage();

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Limite à 100MB par exemple
  }
});

routerMovie.post('/' , 
    upload.fields(
    [
        { name: "video", maxCount: 1 },
        { name: "cover_img", maxCount: 1 },
        { name: "images", maxCount: 3 },
    ])
, MovieController.createMovie)

export default routerMovie;