const authorizeAdmin = require('../../middleware/authorizeAdmin');

function mockReqResNext(user) {
  const req = { user };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('authorizeAdmin middleware', () => {
  it('returns 403 when user role is not admin', () => {
    const { req, res, next } = mockReqResNext({ id: 1, role: 'user' });

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user role is missing (undefined)', () => {
    const { req, res, next } = mockReqResNext({ id: 1 });

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user role is admin', () => {
    const { req, res, next } = mockReqResNext({ id: 1, role: 'admin' });

    authorizeAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
