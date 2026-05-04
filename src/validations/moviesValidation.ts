import { body } from "express-validator"; 

export const validateDirector = [
    // Usamos 'director.campo' para decirle a express-validator dónde buscar
    body("director.civility").notEmpty().withMessage("Veuillez bien remplir la civilité du réalisateur"),
    body("director.firstname").notEmpty().withMessage("Veuillez bien remplir le prénom du réalisateur"),
    body("director.lastname").notEmpty().withMessage("Veuillez bien remplir le nom du réalisateur"),
    body("director.email").isEmail().withMessage("Email invalide pour le réalisateur"),
    body("director.phone").notEmpty().withMessage("Veuillez bien remplir le téléphone du réalisateur"),
    body("director.country").notEmpty().withMessage("Veuillez bien remplir le pays du réalisateur"),
    body("director.birthday").notEmpty().withMessage("Veuillez bien remplir la date de naissance"),
    body("director.address").notEmpty().withMessage("Veuillez bien remplir l'adresse du réalisateur"),
];

export const validateCollaborator = [
    // El '.*.' es OBLIGATORIO aquí porque 'collaborator' es una lista (Array)
    body("collaborator.*.firstname").notEmpty().withMessage("Veuillez bien remplir le prénom du collaborateur"),
    body("collaborator.*.lastname").notEmpty().withMessage("Veuillez bien remplir le nom du collaborateur"),
    body("collaborator.*.email").isEmail().withMessage("Email invalide pour le collaborateur"),
    body("collaborator.*.job").notEmpty().withMessage("Veuillez bien remplir le rôle du collaborateur"),
    body("collaborator.*.contribution").notEmpty().withMessage("Veuillez bien remplir la contribution")
];

export const validateMetadata = [
    
    body("metadata.original_title").notEmpty().withMessage("Le titre original est obligatoire"),
    body("metadata.original_synopsis").notEmpty().withMessage("Le synopsis est obligatoire"),
    body("metadata.duration").isNumeric().withMessage("La durée doit être un nombre valide"),
    body("metadata.tags").notEmpty().withMessage("Veuillez ajouter au moins un tag"),
    body("metadata.language").notEmpty().withMessage("La langue est obligatoire")
];

// Opcional: Unimos todos para que en tu ruta solo tengas que importar 'validateMovieCreation'
export const validateMovieCreation = [
    ...validateDirector,
    ...validateCollaborator,
    ...validateMetadata
];