import db from "../config/database"

interface directorType{
    civility?:string
    firstname:string
    lastname:string
    email:string
    phone:number
    country:string
    birthday:Date
    address:string
}

export const Director = {
    createDirector: async ({civility,firstname,lastname,email,phone,country,birthday,address}: directorType) => {
        console.log(address);
        const sql = `
        INSERT INTO director (civility,firstname,lastname,email,phone,country,birthday,address)
        VALUES(?,?,?,?,?,?,?,?)
        `;
        
        return db.query(sql,  [civility,firstname,lastname,email,phone,country,birthday,JSON.stringify(address)]);

        
    }
    
}
