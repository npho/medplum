import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { authRouter } from './auth';
import { closeDatabase, initDatabase } from './database';
import { dicomRouter } from './dicom/routes';
import { fhirRouter } from './fhir';
import { oauthRouter } from './oauth';

const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // TODO: Check origin against whitelist
    callback(null, true);
  }
};

function errorHandler(req: Request, res: Response, next: NextFunction) {
  try {
    next();
  } catch (error: any) {
    console.log('Medplum unhandled error', error);
    res.sendStatus(500);
  }
}

export async function initApp(app: Express): Promise<Express> {
  await initDatabase();
  app.set('trust proxy', true);
  app.set('x-powered-by', false);
  app.set('json spaces', 2);
  app.use(cors(corsOptions));
  app.use(express.json({
    type: ['application/json', 'application/fhir+json'],
    limit: '5mb'
  }));
  app.use(errorHandler);
  app.get('/', (req: Request, res: Response) => res.sendStatus(200));
  app.get('/healthcheck', (req: Request, res: Response) => res.send({ ok: true }));
  app.use('/auth/', authRouter);
  app.use('/dicom/PS3/', dicomRouter);
  app.use('/fhir/R4/', fhirRouter);
  app.use('/oauth2/', oauthRouter);
  app.use('/scim/v2/', fhirRouter);
  return app;
}

export async function destroyApp(app: Express): Promise<void> {
  await closeDatabase();
}