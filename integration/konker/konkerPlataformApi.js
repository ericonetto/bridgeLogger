'use restrict';

require('./common/winstonConfig')

const axios = require('axios');
var dotenv = require('dotenv');
dotenv.load();

ownerUUID="TRACKER"

// **************** INIT ****************
const requestToken = (ownerUUID) => {
    return process.env.KONKER_TOKEN
}

// **************** SUPPORT FUNCTIONS ****************
const getGetPromise = (ownerUUID, path, application) => {

    LOGGER.debug(`[${ownerUUID}] GET ${path}`);

    return requestToken(ownerUUID)
        .then(result => {
            return axios.get(`${process.env.KONKER_API_HOST}/v1/${application}${path}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${result}`
                    }
                })
                .then(
                    res => res.data.result
                );
        });

}

const getPutPromise = (ownerUUID, path, body, application) => {

    LOGGER.debug(`[${ownerUUID}] PUT ${path}`);

    return requestToken(ownerUUID)
        .then(result => {
            return axios.put(`${process.env.KONKER_API_HOST}/v1/${application}${path}`,
                body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${result}`
                    }
                });
        });

}

const getPostPromise = (ownerUUID, path, body, application) => {

    LOGGER.debug(`[${ownerUUID}] POST ${path}`);

    let completePath
    if (application) {
        completePath = `${application}${path}`
    } else {
        completePath = `${path}`
    }

    return requestToken(ownerUUID)
        .then(result => {
            return axios.post(`${process.env.KONKER_API_HOST}/v1/${completePath}`,
                body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${result}`
                    }
                });
        });

}

const getNoTokenPostPromise = (path, body) => {
    LOGGER.debug(`[${body.email}] Create user POST ${path}`);

    return axios.post(`${process.env.KONKER_API_HOST}/v1${path}`,
        body,
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });
}

const getDeletePromise = (ownerUUID, path, application) => {

    LOGGER.debug(`[${ownerUUID}] DELETE ${path}`);

    return requestToken(ownerUUID)
        .then(result => {
            return axios.delete(`${process.env.KONKER_API_HOST}/v1/${application}${path}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${result}`
                    }
                });
        });
}

const getSendDataPromise = (apiKey, password, body) => {

    LOGGER.debug(`[${ownerUUID}] POST /pub/${apiKey}`);

    return axios.post(`${process.env.KONKER_API_DATA}/pub/${apiKey}/${body.imei}`,
        body,
        {
            headers: {
                'Content-Type': 'text/plain'
            },
            auth: {
                username: apiKey,
                password: password
            }
        });


}

const getGetDataPromise = (apiKey, password, channel) => {
    
    LOGGER.debug(`[${ownerUUID}] GET /sub/${apiKey}/${channel}`);
    return axios.get(`${process.env.KONKER_API_DATA}/sub/${apiKey}/${channel}`,
        {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: apiKey,
                password: password
            }
        });   
    }

//*************** SEND DATA *******************
const sendDataPromise = (apiKey, password, data) => {
    return getSendDataPromise(apiKey, password, data);
}

// **************** EXPORTS ****************
module.exports = {
    sendDataPromise,
    getGetDataPromise
};