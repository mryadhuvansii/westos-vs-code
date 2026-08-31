import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import jwtConfig from './jwt.config';

export const configuration = () => ({
  app: appConfig(),
  database: databaseConfig(),
  redis: redisConfig(),
  jwt: jwtConfig(),
});