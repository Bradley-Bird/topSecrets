const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const mockUser = require('../data/mockUser');
const UserService = require('../lib/services/UserService');
const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;

  await agent.post('/api/v1/users/sessions').send({ email, password });

  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('creates a new user', async () => {
    const resp = await request(app).post('/api/v1/users').send(mockUser);
    const { firstName, lastName, email } = mockUser;
    expect(resp.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });
  it('signs in user', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const resp = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '123123' });
    expect(resp.status).toEqual(200);
  });
  it('signs a user out', async () => {
    const [agent] = await registerAndLogin();
    await agent.delete('/api/v1/secrets');
    const resp = await request(app).get('/api/v1/secrets');
    expect(resp.body).toEqual({
      message: 'You must be signed in to continue',
      status: 401,
    });
  });
  afterAll(() => {
    pool.end();
  });
});
