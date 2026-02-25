
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/scaleway";

export const uploadToScaleway = async (file: any, fileCategory: any) => {
    const folder = process.env.SCALEWAY_FOLDER;
    const bucket = process.env.SCALEWAY_BUCKET_NAME;
    const endpoint = process.env.SCALEWAY_ENDPOINT;
    const ext = file.originalname.split(".").pop();
    const safeName = `${crypto.randomUUID()}.${ext}`;
    const key = `${folder}/${fileCategory}/${safeName}`;
    
    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read",
        })
    );
    return `${endpoint}/${bucket}/${key}`;
};
