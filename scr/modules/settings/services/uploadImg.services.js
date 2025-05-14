const path = require('path');
const { minioClient, bucketName } = require('../../../utilities/minio-setup');
const config = require('../../../config/config');

// Function to upload an image and get a pre-signed URL
const uploadImg = async ({ body, file }) => {
    try {
        console.log('file: ', file);
        // Validate body data
        const { _id, ...settingsData } = body;
        if (!file) {
            return { msg: "Invalid data", status: false, code: 400 };
        }

        const objectName = `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`;
        const fileBuffer = file.buffer;

        // Ensure the bucket exists
        const bucketExists = await minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Bucket '${bucketName}' created successfully.`);
        }

        // Upload the file
        await minioClient.putObject(bucketName, objectName, fileBuffer, file.size, {
            'Content-Type': file.mimetype
        });
        console.log(`File '${objectName}' uploaded successfully.`);

        // Generate a pre-signed URL with a 7-day expiration time
        // const expiry = 7 * 24 * 60 * 60; // 7 days in seconds
        // const presignedUrl = await minioClient.presignedGetObject(bucketName, objectName, expiry);

        return { msg: "Image uploaded successfully", status: true, code: 200, data: `${config?.minIo?.baseUrl}${bucketName}/${objectName}` };
    } catch (error) {
        console.error('Error in uploadImg:', error);
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = uploadImg;
