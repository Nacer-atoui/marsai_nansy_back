
import { Request, Response, NextFunction } from 'express';

export const dataMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {

        //  DIRECTOR 
        if (req.body.director) {
            const rawDirector = req.body.director;          
            const parsedDirector = JSON.parse(rawDirector);  
            req.body.director = parsedDirector;              
        }

        //  METADATA 
        if (req.body.metadata) {
            const rawMetadata = req.body.metadata;
            const parsedMetadata = JSON.parse(rawMetadata);
            req.body.metadata = parsedMetadata;
        }
        //  IA 
        if (req.body.ia) {
            const rawIa = req.body.ia;
            const parsedIa = JSON.parse(rawIa);
            req.body.ia = parsedIa;
        }

        //   MEDIA 
        if (req.body.media) {
            const rawMedia = req.body.media;
            const parsedMedia = JSON.parse(rawMedia);
            req.body.media = parsedMedia;
        }

        //  COLLABORATOR 
        if (req.body.collaborator) {
            const rawCollaborator = req.body.collaborator;
            const parsedCollaborator = JSON.parse(rawCollaborator);
            req.body.collaborator = parsedCollaborator;
        }

        
        next(); 

    } catch (error) {
        return res.status(400).json({ error: "Invalid JSON data format sent from frontend" });
    }
};
