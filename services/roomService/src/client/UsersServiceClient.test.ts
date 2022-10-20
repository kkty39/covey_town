import Express from 'express';
import CORS from 'cors';
import http from 'http';
import { nanoid } from 'nanoid';
import { AddressInfo } from 'net';

import UsersServiceClient, { UserUpdateResponse } from './UsersServiceClient';
import addTownRoutes from '../router/towns';
import { connect, disconnect } from '../database';
import { countUsers } from '../dao/user';

type TestUserData = {
  userName: string;
  password: string;
  email: string,
  gender: string,
  age: string,
  city: string,
};

function createUserInfo(userNameToUse?: string, passwordToUse?: string,
  emailToUse?: string, genderToUse?: string, ageToUse?: string, cityToUse?: string): TestUserData {
  const userName = userNameToUse !== undefined ? userNameToUse : nanoid();
  const password = passwordToUse !== undefined ? passwordToUse : nanoid();
  const email = emailToUse !== undefined ? emailToUse : nanoid();
  const age = ageToUse !== undefined ? ageToUse : nanoid();
  const gender = genderToUse !== undefined ? genderToUse : nanoid();
  const city = cityToUse !== undefined ? cityToUse : nanoid();
  return { userName, password, email, gender, age, city };
}

function expectUserInfoMatches(createdUser: TestUserData, foundUser: UserUpdateResponse) {
  expect(createdUser.password).toBe(foundUser.password);
  expect(createdUser.email).toBe(foundUser.email);
  expect(createdUser.age).toBe(foundUser.age);
  expect(createdUser.gender).toBe(foundUser.gender);
  expect(createdUser.city).toBe(foundUser.city);
}

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: UsersServiceClient;

  beforeAll(async () => {
    // Deploy a testing server
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);
    addTownRoutes(server, app);
    connect(); // make connection to mongodb
    server.listen();
    const address = server.address() as AddressInfo;
    jest.setTimeout(30000);
    // Create the testing client
    apiClient = new UsersServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    // After all tests are done, shut down the server to avoid any resource leaks
    server.close();
    disconnect();
  });

  describe('Create User', () => {
    it('Allows creating user', async () => {
      const testUserData = createUserInfo();
      const initUserCount = await countUsers(testUserData.userName);
      expect(initUserCount).toEqual(0);
      await apiClient.createUser(testUserData);
      const afterUserCount = await countUsers(testUserData.userName);
      expect(afterUserCount).toEqual(1);
    });
  });

  describe('Find User by Name', () => {
    it('Allows finding user by name', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const foundUser = await apiClient.findUserByName(testUserData.userName);
      expectUserInfoMatches(testUserData, foundUser);
    });
    it('Could not find user by false name', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const foundUser = await apiClient.findUserByName(nanoid());
      const falseUserData: TestUserData = {
        userName: testUserData.userName, password: '',
        gender: '', age: '', email: '', city: '',
      };
      expectUserInfoMatches(falseUserData, foundUser);
    });
  });

  describe('Find User by Name and Password', () => {
    it('Allows finding user by name and password', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const res = await apiClient.findUserByNameAndPassword({
        userName: testUserData.userName, password: testUserData.password,
      });
      expect(res).toBe(true);
    });
    it('Cound not find user by false userName', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const res = await apiClient.findUserByNameAndPassword({
        userName: nanoid(), password: testUserData.password,
      });
      expect(res).toBe(false);
    });
    it('Cound not find user by false password', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const res = await apiClient.findUserByNameAndPassword({
        userName: testUserData.userName, password: nanoid(),
      });
      expect(res).toBe(false);
    });
  });


  describe('Update User', () => {
    it('Allows updating user by password', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const newPassword = nanoid();
      const updatedUserData = createUserInfo(testUserData.userName, newPassword,
        undefined, undefined, undefined, undefined);
      await apiClient.updateUser(updatedUserData);
      const foundUser = await apiClient.findUserByName(testUserData.userName);
      expectUserInfoMatches(updatedUserData, foundUser);
    });
    it('Allows updating user by email', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const newEmail = nanoid();
      const updatedUserData = createUserInfo(testUserData.userName, undefined,
        newEmail, undefined, undefined, undefined);
      await apiClient.updateUser(updatedUserData);
      const foundUser = await apiClient.findUserByName(testUserData.userName);
      expectUserInfoMatches(updatedUserData, foundUser);
    });
    it('Allows updating user by gender', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const newGender = nanoid();
      const updatedUserData = createUserInfo(testUserData.userName, undefined,
        undefined, newGender, undefined, undefined);
      await apiClient.updateUser(updatedUserData);
      const foundUser = await apiClient.findUserByName(testUserData.userName);
      expectUserInfoMatches(updatedUserData, foundUser);
    });
    it('Allows updating user by age', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const newAge = nanoid();
      const updatedUserData = createUserInfo(testUserData.userName, undefined,
        undefined, undefined, newAge, undefined);
      await apiClient.updateUser(updatedUserData);
      const foundUser = await apiClient.findUserByName(testUserData.userName);
      expectUserInfoMatches(updatedUserData, foundUser);
    });
    it('Allows updating user by city', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const newCity = nanoid();
      const updatedUserData = createUserInfo(testUserData.userName, undefined,
        undefined, undefined, undefined, newCity);
      await apiClient.updateUser(updatedUserData);
      const foundUser = await apiClient.findUserByName(testUserData.userName);
      expectUserInfoMatches(updatedUserData, foundUser);
    });
    it('Allows updating user by multiple attributes', async () => {
      const testUserData = createUserInfo();
      await apiClient.createUser(testUserData);
      const updatedUserData = createUserInfo(testUserData.userName, nanoid(),
        nanoid(), nanoid(), nanoid(), nanoid());
      await apiClient.updateUser(updatedUserData);
      const foundUser = await apiClient.findUserByName(testUserData.userName);
      expectUserInfoMatches(updatedUserData, foundUser);
    });

  });
});