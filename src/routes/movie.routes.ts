import { Router } from 'express';
import MovieController from '../controllers/movie.controller';
import multer from 'multer';
import { validateCollaborator } from '../validations/moviesValidation';
import validate from '../middlewares/validate';
import { dataMiddleware } from '../middlewares/SubmitMiddleware';
import { upload } from '../middlewares/multer.config';

const routerMovie = Router();

// --- The routes ---

routerMovie.get('/', MovieController.getAllMovies);

routerMovie.get('/:id', MovieController.getMovieById);

// Nouvelles routes d'administration
routerMovie.patch('/:id/status', MovieController.updateMovieStatus);
routerMovie.delete('/:id', MovieController.deleteMovie);

routerMovie.post(
  '/',

  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'cover_img', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]),

  dataMiddleware,

  MovieController.createMovie
);




export default routerMovie;
