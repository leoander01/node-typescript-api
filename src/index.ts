import { SetupServer } from './server';
import config from 'config';
import logger from './logger';

enum ExitStatus {
  Failure = 1,
  Success = 0,
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to on an unhandled promise: ${promise} and reason: ${reason}`
  );
  // lets throw the error and let the uncaughtException handle below handle it
  throw reason;
});

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const  exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.map((sig) => process.on(sig, async () => {
      try {
        await server.close();
        logger.info(`App exited with success`);
        process.exit(ExitStatus.Success);
      } catch(error) {
        logger.error(`App exited with error: ${error}`);
        process.exit(ExitStatus.Failure);
      }
    }));
  } catch(error) {
    logger.error(`App exited with error: ${error}`);
    process.exit(1);
    process.exit(ExitStatus.Failure);
  }
})();
