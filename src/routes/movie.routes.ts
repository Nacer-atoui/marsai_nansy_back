import { Router } from 'express';
// 1. Cambiamos el nombre del import a "MovieController" (porque es el objeto completo)
import MovieController from '../controllers/movie.controller';
import multer from 'multer';

const routerMovie = Router();

// --- The routes ---

routerMovie.get('/', MovieController.getAllMovies);

routerMovie.get('/:id',MovieController.getMovieById);

const upload = multer({ dest: 'uploads/' });

routerMovie.post('/' , upload.single('video'), MovieController.createMovie)

export default routerMovie;