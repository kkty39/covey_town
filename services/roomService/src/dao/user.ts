import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const UserSchema = new Schema({
  userName: { type: String, required: true, index: true, unique: true },
  password: { type: String, required: true },
  email: String,
  gender: String,
  age: String,
  city: String,
});

type UserInfo = {
  password: string,
  email: string,
  gender: string,
  age: string,
  city: string,
};

type CreateUserInfo = {
  userName: string;
  password: string;
  email: string;
  gender: string;
  age: string;
  city: string;
};

// This model is mapping to MongoDB 'user' collection
export const UserModel = model('User', UserSchema, 'user');

// export const createUser = async (user_instance: Object):Promise<void> => UserModel.create(user_instance);
export const createUser = async (user_instance: CreateUserInfo): Promise<void> => UserModel.create(user_instance);

export const findUserByName = async (userName: string): Promise<UserInfo> => {
  const filter = { userName };
  const user = await UserModel.findOne(filter);
  return user;
};

export const findUserByNameAndPassword = async (userName: string, password: string): Promise<UserInfo> => {
  const filter = { userName, password };
  const user = await UserModel.findOne(filter);
  return user;
};

export const updateUserByName = async (userName: string, updated_info: UserInfo): Promise<void> => {
  const filter = { userName };
  await UserModel.findOneAndUpdate(filter, updated_info);
};

export const deleteUserByName = async (name: string): Promise<void> => UserModel.deleteOne({ userName: name });
// Example:
// const user_instance = { userName: 'TestUser', password: 'passw0rd' };
// createUser(user_instance); # Insert User into db
// updateUserByName('TestUser', {gender: 'female'}); # Update user information

export const countUsers = async (userName: string): Promise<number> => {
  const filter = { userName };
  const number = await UserModel.countDocuments(filter);
  return number;
};