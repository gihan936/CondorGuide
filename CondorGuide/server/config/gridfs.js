import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gfs, gridfsBucket;

mongoose.connection.once('open', () => {
  gridfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'issueImages',
  });
  console.log('GridFS Bucket ready: issueImages');
});

export const getGridFSBucket = () => gridfsBucket;
