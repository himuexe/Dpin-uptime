#!/usr/bin/env node

require('dotenv').config();
const { program } = require('commander');
const winston = require('winston');
const NodeClient = require('./lib/NodeClient');
const { version } = require('./package.json');

// Setup logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'node-client.log' })
  ]
});

// Initialize NodeClient
const nodeClient = new NodeClient(logger);

program
  .name('depin-uptime-node-client')
  .description('DePIN Uptime Platform Node Client')
  .version(version);

program
  .command('register')
  .description('Register this node with the NodeRegistry contract')
  .option('-n, --name <name>', 'Node name', process.env.NODE_NAME)
  .option('-e, --endpoint <endpoint>', 'Node endpoint URL', process.env.NODE_ENDPOINT)
  .action(async (options) => {
    try {
      const result = await nodeClient.registerNode(options.name, options.endpoint);
      logger.info(`Node registered successfully with ID: ${result.nodeId}`);
    } catch (error) {
      logger.error(`Failed to register node: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('check')
  .description('Check the status of a specific website')
  .requiredOption('-w, --website-id <id>', 'Website ID to check')
  .option('-n, --node-id <id>', 'Node ID to use for reporting', process.env.NODE_ID)
  .action(async (options) => {
    try {
      const result = await nodeClient.checkWebsite(options['website-id'], options['node-id']);
      logger.info(`Website check completed: ${JSON.stringify(result)}`);
    } catch (error) {
      logger.error(`Failed to check website: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('start')
  .description('Start automatic checking of all active websites')
  .option('-i, --interval <minutes>', 'Check interval in minutes', process.env.CHECK_INTERVAL || 5)
  .option('-n, --node-id <id>', 'Node ID to use for reporting', process.env.NODE_ID)
  .action(async (options) => {
    try {
      logger.info(`Starting automatic website checking (interval: ${options.interval} minutes)`);
      await nodeClient.startAutomaticChecking(options.interval, options['node-id']);
    } catch (error) {
      logger.error(`Error in automatic checking: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Get current node status and statistics')
  .option('-n, --node-id <id>', 'Node ID to check status for', process.env.NODE_ID)
  .action(async (options) => {
    try {
      const status = await nodeClient.getNodeStatus(options['node-id']);
      logger.info(`Node status: ${JSON.stringify(status, null, 2)}`);
    } catch (error) {
      logger.error(`Failed to get node status: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

// If no arguments, display help
if (process.argv.length === 2) {
  program.help();
} 