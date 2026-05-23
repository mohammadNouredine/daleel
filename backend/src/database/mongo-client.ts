import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { getDatabaseNameFromUri } from './mongo.utils';

config();

const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/daleel';
const databaseName = getDatabaseNameFromUri(uri);

export const mongoClient = new MongoClient(uri);

export const mongoDb = mongoClient.db(databaseName);

export { databaseName as mongoDatabaseName };

if (process.env.NODE_ENV !== 'test') {
  console.log(`[mongo-client] Using database: "${databaseName}"`);
}
