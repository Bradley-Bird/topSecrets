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

  await agent.post('/api/v1/users/sessions').send({ email, password });

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
    const resp = await agent.get('/api/v1/secrets');
    expect(resp.body[0].description).toEqual('DECLASSIFIED IS IN!');
    expect(resp.body[0].title).toEqual('CLASSIFIED IS OUT');
    expect(resp.body[1].title).toEqual('In reguards to last post');
  });
});
