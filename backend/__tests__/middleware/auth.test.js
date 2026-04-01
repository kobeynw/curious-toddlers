const jwt = require('jsonwebtoken');
const authenticate = require('../../middleware/auth');

jest.mock('jsonwebtoken');

function mockReqResNext(cookies = {}) {
  const req = { cookies };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret';
});

describe('authenticate middleware', () => {
  it('returns 401 when no token cookie is present', () => {
    const { req, res, next } = mockReqResNext({});

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
    const { req, res, next } = mockReqResNext({ token: 'bad-token' });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next on valid token', () => {
    const payload = { id: 1, email: 'test@example.com', name: 'Test' };
    jwt.verify.mockReturnValue(payload);
    const { req, res, next } = mockReqResNext({ token: 'valid-token' });

    authenticate(req, res, next);

    expect(req.user).toEqual({ id: 1, email: 'test@example.com', name: 'Test' });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
