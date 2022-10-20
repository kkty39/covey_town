import assert from 'assert';
import { Socket } from 'socket.io';
import { CoveyTownList, UserLocation } from '../CoveyTypes';
import {
  addAdminToRoom,
  addBlockerToRoom,
  createRoom,
  deleteRoomById,
  getRoomById,
  removeAdminFromRoom,
  removeBlockerFromRoom,
} from '../dao/room';
import {
  createUser,
  findUserByName,
  findUserByNameAndPassword,
  updateUserByName,
} from '../dao/user';
import CoveyTownsStore from '../lib/CoveyTownsStore';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */
export interface TownJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

export interface TownAddBlockerRequest {
  /** userName of the player that would like to join * */
  blockerName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

export interface TownAddAdminRequest {
  /** userName of the player that would like to join * */
  AdminName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

export interface TownDeleteBlockerRequest {
  /** userName of the player that would like to join * */
  blockerName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

export interface TownDeleteAdminRequest {
  /** userName of the player that would like to join * */
  AdminName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

export interface TownlistByTownIdRequest {
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

export interface TownlistByTownIdResponse {
  /** ID of the town that the player would like to join * */
  blockers: string[];
  creator: string;
  admins: string[];
}

/**
 * The format of a response to join a Town in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface TownJoinResponse {
  /** Unique ID that represents this player * */
  coveyUserID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  coveySessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
}

/**
 * Payload sent by client to create a Town in Covey.Town
 */
export interface TownCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;
  creatorName: string;
}

/**
 * Response from the server for a Town create request
 */
export interface TownCreateResponse {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Response from the server for a Town list request
 */
export interface TownListResponse {
  towns: CoveyTownList;
}

/**
 * Payload sent by the client to delete a Town
 */
export interface TownDeleteRequest {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Payload sent by the client to update a Town.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface TownUpdateRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export interface UserSignInRequest {
  userName: string;
  password: string;
}

export interface UserSignUpRequest {
  userName: string;
  password: string;
  email: string;
  gender: string;
  age: string;
  city: string;
}

export interface UserUpdateRequest {
  userName: string;
  password: string;
  email: string;
  gender: string;
  age: string;
  city: string;
}

export interface UserUpdateResponse {
  password: string;
  email: string;
  gender: string;
  age: string;
  city: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

/**
 * A handler to process a player's request to join a town. The flow is:
 *  1. Client makes a TownJoinRequest, this handler is executed
 *  2. Client uses the sessionToken returned by this handler to make a subscription to the town,
 *  @see townSubscriptionHandler for the code that handles that request.
 *
 * @param requestData an object representing the player's request
 */
export async function townJoinHandler(
  requestData: TownJoinRequest,
): Promise<ResponseEnvelope<TownJoinResponse>> {
  const townsStore = CoveyTownsStore.getInstance();

  const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);
  if (!coveyTownController) {
    return {
      isOK: false,
      message: 'Error: No such town',
    };
  }
  const result = await getRoomById(requestData.coveyTownID);
  if (result === null) {
    return {
      isOK: false,
      message: 'Error: No such town',
    };
  }

  if (result.blockers.find((blocker: string) => blocker === requestData.userName))
    return {
      isOK: false,
      message: `User ${requestData.userName} is in the block list`,
    };

  const newPlayer = new Player(requestData.userName);
  const newSession = await coveyTownController.addPlayer(newPlayer);
  assert(newSession.videoToken);
  return {
    isOK: true,
    response: {
      coveyUserID: newPlayer.id,
      coveySessionToken: newSession.sessionToken,
      providerVideoToken: newSession.videoToken,
      currentPlayers: coveyTownController.players,
      friendlyName: coveyTownController.friendlyName,
      isPubliclyListed: coveyTownController.isPubliclyListed,
    },
  };
}

/**
 * A handler to process a creator or admin request to add a player to block list in a town. The flow is:
 *  1. Client makes a TownAddBlockerRequest, this handler is executed
 *
 * @param requestData an object representing the add to block kust request
 */
export async function townAddBlockerHandler(
  requestData: TownAddBlockerRequest,
): Promise<ResponseEnvelope<void>> {
  const townsStore = CoveyTownsStore.getInstance();

  const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);
  if (!coveyTownController) {
    return {
      isOK: false,
      message: 'Error: No such town!',
    };
  }

  const result = await getRoomById(requestData.coveyTownID);
  if (result === null) {
    return {
      isOK: false,
      message: 'Error: No such town!',
    };
  }
  if (result.blockers.find((blocker: string) => blocker === requestData.blockerName)) {
    return {
      isOK: true,
      message: 'User is already in the block list',
    };
  }
  await addBlockerToRoom(result.roomid, requestData.blockerName);
  // coveyTownController.addBlocker(requestData.blockerName);

  return {
    isOK: true,
    message: 'Add blocker',
  };
}

/**
 * A handler to process a creator request to add a admin to town. The flow is:
 *  1. Client makes a townAddAdminHandler, this handler is executed
 *
 * @param requestData an object representing the assign a player as admin request
 */
export async function townAddAdminHandler(
  requestData: TownAddAdminRequest,
): Promise<ResponseEnvelope<void>> {
  const townsStore = CoveyTownsStore.getInstance();

  const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);
  if (!coveyTownController) {
    return {
      isOK: false,
      message: 'Error: No such town!',
    };
  }

  const result = await getRoomById(requestData.coveyTownID);
  if (result === null) {
    return {
      isOK: false,
      message: 'Error: No such town!',
    };
  }
  if (result.admins && result.admins.find((admin: string) => admin === requestData.AdminName)) {
    return {
      isOK: true,
      message: 'User is already in the Admin list',
    };
  }
  await addAdminToRoom(result.roomid, requestData.AdminName);
  // coveyTownController.addBlocker(requestData.blockerName);

  return {
    isOK: true,
    message: 'Add Admin',
  };
}

export async function townListHandler(): Promise<ResponseEnvelope<TownListResponse>> {
  const townsStore = CoveyTownsStore.getInstance();
  // Read public towns from database
  await townsStore.loadTownsFromDb();
  return {
    isOK: true,
    response: { towns: townsStore.getTowns() },
  };
}

export async function singleTownListHandler(
  requestData: TownlistByTownIdRequest,
): Promise<ResponseEnvelope<TownlistByTownIdResponse>> {
  const result = await getRoomById(requestData.coveyTownID);
  // if (result === null) {
  //   return {
  //     isOK: false,
  //     message: 'Error: No such town1',
  //   };
  // }
  return {
    isOK: true,
    response: { blockers: result.blockers, creator: result.creator, admins: result.admins as string[] },
    message: 'single town list',
  };
}

export async function townCreateHandler(
  requestData: TownCreateRequest,
): Promise<ResponseEnvelope<TownCreateResponse>> {
  const townsStore = CoveyTownsStore.getInstance();
  if (requestData.friendlyName.length === 0) {
    return {
      isOK: false,
      message: 'FriendlyName must be specified',
    };
  }
  const newTown = townsStore.createTown(requestData.friendlyName, requestData.isPubliclyListed);
  await createRoom({
    roomid: newTown.coveyTownID,
    passsword: newTown.townUpdatePassword,
    roomname: newTown.friendlyName,
    admins: [],
    creator: requestData.creatorName,
    blockers: [],
    isPublic: newTown.isPubliclyListed,
  });
  return {
    isOK: true,
    response: {
      coveyTownID: newTown.coveyTownID,
      coveyTownPassword: newTown.townUpdatePassword,
    },
  };
}

export async function townDeleteHandler(
  requestData: TownDeleteRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const townsStore = CoveyTownsStore.getInstance();
  const success = townsStore.deleteTown(requestData.coveyTownID, requestData.coveyTownPassword);
  if (success) {
    await deleteRoomById(requestData.coveyTownID);
  }
  return {
    isOK: success,
    response: {},
    message: !success
      ? 'Invalid password. Please double check your town update password.'
      : undefined,
  };
}

export async function townBlockerDeleteHandler(
  requestData: TownDeleteBlockerRequest,
): Promise<ResponseEnvelope<void>> {
  const result = await getRoomById(requestData.coveyTownID);
  if (result === null) {
    return {
      isOK: false,
      message: 'Error: No such town!',
    };
  }
  await removeBlockerFromRoom(requestData.coveyTownID, requestData.blockerName);
  return {
    isOK: true,
    message: 'Blocker removed',
  };
}

export async function townAdminDeleteHandler(
  requestData: TownDeleteAdminRequest,
): Promise<ResponseEnvelope<void>> {
  const result = await getRoomById(requestData.coveyTownID);
  if (result === null) {
    return {
      isOK: false,
      message: 'Error: No such town!',
    };
  }
  await removeAdminFromRoom(requestData.coveyTownID, requestData.AdminName);
  return {
    isOK: true,
    message: 'Admin removed',
  };
}

export async function townUpdateHandler(
  requestData: TownUpdateRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const townsStore = CoveyTownsStore.getInstance();
  const success = townsStore.updateTown(
    requestData.coveyTownID,
    requestData.coveyTownPassword,
    requestData.friendlyName,
    requestData.isPubliclyListed,
  );
  return {
    isOK: success,
    response: {},
    message: !success
      ? 'Invalid password or update values specified. Please double check your town update password.'
      : undefined,
  };
}

/**
 * Check whether username exists
 * @param requestData username
 * @returns the account information of the user
 */
export async function checkUserByNameHandler(
  requestData: string,
): Promise<ResponseEnvelope<UserUpdateResponse>> {
  const result = await findUserByName(requestData);
  if (result !== null) {
    return {
      isOK: true,
      response: {
        password: result.password,
        email: result.email,
        gender: result.gender,
        age: result.age,
        city: result.city,
      },
    };
  }
  return {
    isOK: false,
    response: {
      password: '',
      email: '',
      gender: '',
      age: '',
      city: '',
    },
  };
}

/**
 * Sign up a user, adding it to the database
 * @param requestData the account information of the user
 */
export async function createUserHandler(
  requestData: UserSignUpRequest,
): Promise<ResponseEnvelope<void>> {
  await createUser(requestData);
  return {
    isOK: true,
  };
}

/**
 * Check whether a user with a specified pair of username and password exists
 * @param requestData the pair of username and password
 */
export async function checkUserByNameAndPasswordHandler(
  requestData: UserSignInRequest,
): Promise<ResponseEnvelope<void>> {
  const result = await findUserByNameAndPassword(requestData.userName, requestData.password);
  if (result !== null) {
    return {
      isOK: true,
    };
  }
  return {
    isOK: false,
  };
}

/**
 * Update a user account
 * @param requestData the updated account information
 */
export async function updateUserHandler(
  requestData: UserUpdateRequest,
): Promise<ResponseEnvelope<void>> {
  await updateUserByName(
    requestData.userName,
    {
      password: requestData.password,
      email: requestData.email,
      gender: requestData.gender,
      age: requestData.age,
      city: requestData.city,
    },
  );
  return {
    isOK: true,
  };
}

/**
 * An adapter between CoveyTownController's event interface (CoveyTownListener)
 * and the low-level network communication protocol
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
function townSocketAdapter(socket: Socket): CoveyTownListener {
  return {
    onPlayerMoved(movedPlayer: Player) {
      socket.emit('playerMoved', movedPlayer);
    },
    onPlayerDisconnected(removedPlayer: Player) {
      socket.emit('playerDisconnect', removedPlayer);
    },
    onPlayerJoined(newPlayer: Player) {
      socket.emit('newPlayer', newPlayer);
    },
    onTownDestroyed() {
      socket.emit('townClosing');
      socket.disconnect(true);
    },
  };
}

/**
 * A handler to process a remote player's subscription to updates for a town
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
export function townSubscriptionHandler(socket: Socket): void {
  // Parse the client's session token from the connection
  // For each player, the session token should be the same string returned by joinTownHandler
  const { token, coveyTownID } = socket.handshake.auth as { token: string; coveyTownID: string };

  const townController = CoveyTownsStore.getInstance().getControllerForTown(coveyTownID);

  // Retrieve our metadata about this player from the TownController
  const s = townController?.getSessionByToken(token);
  if (!s || !townController) {
    // No valid session exists for this token, hence this client's connection should be terminated
    socket.disconnect(true);
    return;
  }

  // Create an adapter that will translate events from the CoveyTownController into
  // events that the socket protocol knows about
  const listener = townSocketAdapter(socket);
  townController.addTownListener(listener);

  // Register an event listener for the client socket: if the client disconnects,
  // clean up our listener adapter, and then let the CoveyTownController know that the
  // player's session is disconnected
  socket.on('disconnect', () => {
    townController.removeTownListener(listener);
    townController.destroySession(s);
  });

  // Register an event listener for the client socket: if the client updates their
  // location, inform the CoveyTownController
  socket.on('playerMovement', (movementData: UserLocation) => {
    townController.updatePlayerLocation(s.player, movementData);
  });
}
