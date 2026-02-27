import { Router } from 'express';
import RatingController from '../controllers/rating.controller';

const routerRating = Router();
routerRating.post('/', RatingController.createRating);

export default routerRating;