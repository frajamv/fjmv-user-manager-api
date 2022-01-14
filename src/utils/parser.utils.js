response = {}

/**
 * Returns the data obtained from the requested service with a successfull status code (or 200 if null) through the HTTP response created through express.
 * @param {*} http_response HTTP response.
 * @param {*} status_code HTTP status code (200 if not provided).
 * @param {*} data Response data.
 */
response.parseSuccess = (http_response, status_code, data) => {
    http_response.status(status_code || 200).send(data)
}

/**
 * Returns the data obtained from the requested service with a 200 status code by default through the HTTP response created through express.
 * @param {*} http_response HTTP response.
 * @param {*} data Response data.
 */
response.parseSuccessOK = (http_response, data) => {
    http_response.status(200).send(data)
}

/**
 * Returns an error message thrown by the requested service with an error status code (or 500 if null) through the HTTP response created through express.
 * @param {*} http_response HTTP response.
 * @param {*} status_code HTTP status code (500 if not provided).
 * @param {*} data Response data.
 */
response.parseError = (http_response, status_code, message) => {
    http_response.status(status_code || 500).send(message)
}

/**
 * Converts a Sequelize object to a JSON object with the data fetched through sequelize.
 * @param {*} data The Sequelize object to be converted to JSON object.
 * @returns JSON object containing all the required data.
 */
response.parseSQLData = (data) => {
    const parsed_data = JSON.stringify(data, null, 2)
    const object_data = JSON.parse(parsed_data)

    return object_data
}

module.exports = response