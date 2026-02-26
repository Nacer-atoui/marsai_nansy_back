import { Router } from 'express';
import RatingController from '../controllers/rating.controller';

const routerRating = Router();

// Route POST pour voter
routerRating.post('/', RatingController.createRating);

export default routerRating;