import { Router } from 'express';
// 1. Cambiamos el nombre del import a "MovieController" (porque es el objeto completo)
import MovieController from '../controllers/movie.controller';

const routerMovie = Router();

// --- The routes ---

routerMovie.get('/', MovieController.getAllMovies);

routerMovie.get('/:id',MovieController.getMovieById);

export default routerMovie;