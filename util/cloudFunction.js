/**
 * Wrapper to call cloud function with given parameters.
 */
const _ = require('lodash');
const assert = require('assert').strict;
const fetch = require('node-fetch');

const cFunction = (fn) => async (data) => {
    const CLOUD_FUNCTION_MAP = {
        compareUsers: process.env.FUNCTION_COMPARE_USERS,
        importData: process.env.FUNCTION_IMPORT_DATA,
    };
    assert(_.has(CLOUD_FUNCTION_MAP, fn), 'cloud function does not exist.');
    const cfEndpoint = _.get(CLOUD_FUNCTION_MAP, fn, false);
    console.log('endpoint', cfEndpoint, fn, CLOUD_FUNCTION_MAP);
    const request = await fetch(cfEndpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }).then(async (res) => await res.json());
    return request;
};

module.exports = cFunction;
