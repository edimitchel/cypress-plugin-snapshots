/* globals Cypress, before, after, cy */
/* eslint-env browser */
const { MATCH_TEXT } = require('../tasks/taskNames');
const getTaskData = require('../utils/commands/getTaskData');
const logMessage = require('../utils/commands/logMessage');
const { NO_LOG } = require('../constants');
const { COMMAND_MATCH_SNAPSHOT: commandName } = require('./commandNames');

let retryCount;

function toMatchSnapshot(subject, options) {
  if (retryCount === undefined) {
    retryCount = cy.state('runnable')._retries;
  }
  return getTaskData({
      commandName,
      options,
      subject,
      isRetry: retryCount < cy.state('runnable')._retries
    }).then(taskData => cy.task(
        MATCH_TEXT,
        taskData,
        NO_LOG
      ).then((result) => {
        if (!result.passed && retryCount > 0) {
          retryCount--;
          return toMatchSnapshot(subject, options);
        }
        retryCount = undefined;
        return logMessage(result);
      })
    );
}

module.exports = toMatchSnapshot;
