import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import * as service from '@/database/service';
import { buildError, buildNext, buildReq } from 'test/builders';
import { get } from './user.middleware';

jest.mock('@/database/service');

describe('Middleware > User', () => {
  const error = buildError(
    StatusCodes.UNPROCESSABLE_ENTITY,
    `${ReasonPhrases.UNPROCESSABLE_ENTITY}: header should contain a valid email`,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should forward an error when an email is NOT provided in the headers', () => {
    const req = buildReq({ headers: {} });
    const next = buildNext();

    get(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should forward an error when an email is provided in the headers but is invalid', () => {
    const req = buildReq({
      headers: {
        email: 'foo @bar.com',
      },
    });
    const next = buildNext();

    get(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return an user object given a valid email is provided', async () => {
    const req = buildReq();
    const next = buildNext();
    const response = {
      id: 1,
      email: req.headers.email,
    };

    jest.spyOn(service, 'findOrSave').mockResolvedValueOnce([response]);

    await get(req, null, next);

    expect(req.user).toBeDefined();
    expect(req.user).toEqual(response);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(/* nothing! */);
  });

  it('should forward an error when service.findOrSave fails', async () => {
    const req = buildReq();
    const next = buildNext();

    delete req.user;

    jest.spyOn(service, 'findOrSave').mockRejectedValueOnce('Any error');

    await get(req, null, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith('Any error');
  });
});
