import { ObjectId } from 'mongodb';

export function toObjectId(value: string): ObjectId {
  if (!ObjectId.isValid(value)) {
    throw new Error(`Invalid ObjectId: ${value}`);
  }
  return new ObjectId(value);
}
