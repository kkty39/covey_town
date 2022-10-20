import axios, { AxiosInstance } from 'axios';
import assert from 'assert';

/**
 * The format of a request fro a user to sign in
 */
export interface UserSignInRequest {
  userName: string;
  password: string;
}

/**
 * The format of a request for a user to sign up or update
 */
export interface UserSignUpRequest {
  userName: string;
  password: string;
  email: string,
  gender: string,
  age: string,
  city: string,
}

/**
 * Response from the server for a user update request
 */
export interface UserUpdateResponse {
  password: string;
  email: string,
  gender: string,
  age: string,
  city: string,
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export default class UsersServiceClient {
  private _axios: AxiosInstance;

  /**
   * Construct a new Users Service API client. Specify a serviceURL for testing, or otherwise
   * defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL
   * @param serviceURL
   */
  constructor(serviceURL?: string) {
    const baseURL = serviceURL || process.env.REACT_APP_TOWNS_SERVICE_URL;
    assert(baseURL);
    this._axios = axios.create({ baseURL });
  }

  /**
   * Try to find a user given a name
   * @param requestData the username
   * @returns the response field from the server
   */
  async findUserByName(requestData: string): Promise<UserUpdateResponse> {
    const responseWrapper  = await this._axios.get<ResponseEnvelope<UserUpdateResponse>>(`/signup/${requestData}`);
    assert(responseWrapper.data.response);
    return responseWrapper.data.response;
  }

  /**
   * Try to find a user given a pair of name and password
   * @param requestData a pair of username and password
   * @returns true if found, otherwise false
   */
  async findUserByNameAndPassword(requestData: UserSignInRequest): Promise<boolean> {
    const responseWrapper  = await this._axios.get<ResponseEnvelope<void>>(`/signin/${requestData.userName}/${requestData.password}`);
    if (responseWrapper.data.isOK) {
      return true;
    }
    return false;
  }

  /**
   * Add a user to the database
   * @param requestData the account information of a user
   */
  async createUser(requestData: UserSignUpRequest): Promise<void> {
    await this._axios.post<ResponseEnvelope<void>>('/signup', requestData);
  }

  /**
   * Update a user account
   * @param requestData the username as well as other updated information of a user
   */
  async updateUser(requestData: UserSignUpRequest): Promise<void> {
    await this._axios.patch<ResponseEnvelope<void>>(`/profile/${requestData.userName}`, {
      password: requestData.password,
      email: requestData.email,
      gender: requestData.gender,
      age: requestData.age,
      city: requestData.city,
    });
  }
}
