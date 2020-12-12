const { post } = require('axios');

const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;

exports.handler = async function(event, context, callback) {
    const isChallenge = Boolean(event.queryStringParameters.challenge);
    const isDropboxWebHook = Boolean(event.headers['x-dropbox-signature']);

    function send({ config, message }) {
        callback(null, config);
        console.log(message || config.body);
    }

    if (isChallenge) {
        return send({
            message: 'Dropbox challenge successfully completed',
            config: {
                statusCode: 200,
                body: event.queryStringParameters.challenge,
                headers: {
                    'Content-Type': 'text/plain',
                    'X-Content-Type-Options': 'nosniff'
                }
            }
        });
    }

    if (!isDropboxWebHook) {
        return send({
            config: {
                statusCode: 200,
                body: 'No Dropbox web hook detected',
            }
        });
    }

    if (!buildHookUrl) {
        return send({
            config: {
                statusCode: 200,
                body: 'No Netlify build hook detected',
            }
        });
    }

    await post(buildHookUrl);

    send({
        config: {
            statusCode: 200,
            body: 'Dropbox web hook forwarded to Netlify',
        }
    });
}
