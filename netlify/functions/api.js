const serverless = require('serverless-http');
const { app } = require('../../backend/dist/index');

module.exports.handler = serverless(app);
