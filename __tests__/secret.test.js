const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const secretData = require('../data/secretData');
const mockUser = require('../data/mockUser');
const UserService = require('../lib/services/UserService');

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  console.log('user', user);
  await agent.post('/api/v1/users/sessions').send({ email, password });
  console.log('hello', agent, user);

  return [agent, user];
};

describe('secret paths', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });
  it('displays secrets if authenticated', async () => {
    const [agent] = await registerAndLogin();
    console.log('agent', agent);
    const resp = await agent.get('/api/v1/secrets');
    console.log('resp', resp);
    expect(resp.body).toEqual(secretData);
  });
});
