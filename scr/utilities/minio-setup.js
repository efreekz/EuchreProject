const Minio = require('minio');
const config = require('../config/config');

// Initialize the MinIO client
const minioClient = new Minio.Client({
    endPoint: '89.147.109.27',
    port: 9000,
    useSSL: false,
    accessKey: config.minIo.accessKey,
    secretKey: config.minIo.secret
});
const bucketName = 'euchrefreekz'

// Function to create a bucket
// const createBucket = async (bucketName) => {
//   try {
//     const exists = await minioClient.bucketExists(bucketName);
//     if (!exists) {
//       await minioClient.makeBucket(bucketName, 'us-east-1');
//       console.log(`Bucket '${bucketName}' created successfully.`);
//     } else {
//       console.log(`Bucket '${bucketName}' already exists.`);
//     }
//   } catch (error) {
//     console.error('Error creating bucket:', error);
//   }
// };

// // Function to upload a file
// const uploadFile = async (bucketName, fileName, filePath) => {
//   try {
//     await minioClient.fPutObject(bucketName, fileName, filePath);
//     console.log(`File '${fileName}' uploaded successfully.`);
//   } catch (error) {
//     console.error('Error uploading file:', error);
//   }
// };

// // Function to download a file
// const downloadFile = async (bucketName, fileName, downloadPath) => {
//   try {
//     await minioClient.fGetObject(bucketName, fileName, downloadPath);
//     console.log(`File '${fileName}' downloaded successfully.`);
//   } catch (error) {
//     console.error('Error downloading file:', error);
//   }
// };

// Example usage
// (async () => {
//   const bucketName = 'example-bucket';
//   const fileName = 'example.txt';
//   const filePath = '/path/to/example.txt';
//   const downloadPath = '/path/to/downloaded-example.txt';

//   await createBucket(bucketName);
//   await uploadFile(bucketName, fileName, filePath);
//   await downloadFile(bucketName, fileName, downloadPath);
// })();

module.exports = { minioClient, bucketName }; // Export the MinIO client for use in other files. This is a simple example, in a real-world application you would want to handle errors and exceptions more robustly.
