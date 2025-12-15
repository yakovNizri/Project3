import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { appConfig } from "../config";
import fs from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

function getS3Client(): S3Client {
    const accessKeyId = appConfig.s3_config.key;
    const secretAccessKey = appConfig.s3_config.secret;
    const region = appConfig.s3_config.region;

    const s3Client = new S3Client({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey
        }
    });

    return s3Client;
}

export async function uploadToS3Readable(fileStream: Readable, fileName: string): Promise<void> {
    const client = getS3Client();

    const upload = new Upload({
        client,
        params: {
            Bucket: appConfig.s3_config.bucket_name,
            Key: appConfig.s3_config.imagesVacationFolder + "/" + fileName,
            Body: fileStream
        }
    });

    try {
        await upload.done();
        console.log("Readable file successfully uploaded");
    } catch (error) {
        console.log("ERROR Readable file not uploaded", error);
    }
}

export async function uploadToS3(filePath: string, fileName: string): Promise<void> {
    const bucket = appConfig.s3_config.bucket_name;

    const s3Client = getS3Client();

    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
        Bucket: bucket,
        Key: appConfig.s3_config.imagesVacationFolder + "/" + fileName,
        Body: fileStream
    }

    try {
        const command = new PutObjectCommand(uploadParams);
        const result = await s3Client.send(command);
        console.log(`File successfully uploaded to ${bucket}. name: ${fileName}. result: \n${result}`);
    } catch (error) {
        console.log("Error during upload to s3. more info: ", error);
    }
}

export async function deleteFromS3(objectName: string): Promise<void> {
    const bucket = appConfig.s3_config.bucket_name;

    const s3Client = getS3Client();

    const deleteParams = {
        Bucket: bucket,
        Key: appConfig.s3_config.imagesVacationFolder + "/" + objectName
    }

    try {
        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        console.log(`Object ${objectName} successfully deleted from S3 ${bucket}`);
    } catch (error) {
        console.log("Error during deleting from S3. more info: ", error);
    }
}