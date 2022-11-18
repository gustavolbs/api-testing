import app from '@/app';
import supertest from 'supertest';
import * as service from '@/database/service';

import { buildUser } from './builders';

jest.mock('@/database/service');

export function buildCall(endpoint, method = 'get', body = null) {
  const request = supertest(app);
  const user = buildUser();

  jest.spyOn(service, 'findOrSave').mockResolvedValue([user, true]);

  return request[method](endpoint).send(body).set('email', user.email);
}
