import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import {
  checkUserByNameAndPasswordHandler,
  checkUserByNameHandler,
  createUserHandler,
  singleTownListHandler,
  townAddAdminHandler,
  townAddBlockerHandler,
  townAdminDeleteHandler,
  townBlockerDeleteHandler,
  townCreateHandler,
  townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
  updateUserHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

export default function addTownRoutes(http: Server, app: Express): io.Server {
  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Add a blocker to town
   */
  app.post('/towns/:townID/blockers/:blockerName', BodyParser.json(), async (req, res) => {
    try {
      const result = await townAddBlockerHandler({
        blockerName: req.params.blockerName,
        coveyTownID: req.params.townID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Add a admin to town
   */
  app.post('/towns/:townID/admins/:adminName', BodyParser.json(), async (req, res) => {
    try {
      const result = await townAddAdminHandler({
        AdminName: req.params.adminName,
        coveyTownID: req.params.townID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200).json(result);
    } catch (err) {
      logError(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });

  /**
   * remove a blocker from the town
   */
  app.delete('/towns/:townID/blockers/:blockerName', BodyParser.json(), async (req, res) => {
    try {
      const result = await townBlockerDeleteHandler({
        coveyTownID: req.params.townID,
        blockerName: req.params.blockerName,
      });
      res.status(200).json(result);
    } catch (err) {
      logError(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });

  /**
   * remove a admin from the town
   */
  app.delete('/towns/:townID/admins/:adminName', BodyParser.json(), async (req, res) => {
    try {
      const result = await townAdminDeleteHandler({
        coveyTownID: req.params.townID,
        AdminName: req.params.adminName,
      });
      res.status(200).json(result);
    } catch (err) {
      logError(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await townListHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  app.get('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await singleTownListHandler({ coveyTownID: req.params.townID });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Create a town
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await townCreateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  /**
   * Update a town
   */
  app.patch('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Get a username
   */
  app.get('/signup/:name', BodyParser.json(), async (_req, res) => {
    try {
      const result = await checkUserByNameHandler(_req.params.name);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Create a user account
   */
  app.post('/signup', BodyParser.json(), async (req, res) => {
    try {
      const result = await createUserHandler({
        userName: req.body.userName,
        password: req.body.password,
        email: req.body.email,
        gender: req.body.gender,
        age: req.body.age,
        city: req.body.city,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Get a pair of username and password
   */
  app.get('/signin/:name/:password', BodyParser.json(), async (_req, res) => {
    try {
      const result = await checkUserByNameAndPasswordHandler({
        userName: _req.params.name,
        password: _req.params.password,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Update a user account
   */
  app.patch('/profile/:name', BodyParser.json(), async (req, res) => {
    try {
      const result = await updateUserHandler({
        userName: req.params.name,
        password: req.body.password,
        email: req.body.email,
        gender: req.body.gender,
        age: req.body.age,
        city: req.body.city,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
