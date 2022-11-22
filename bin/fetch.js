const axios = require("axios");
/**
 * Calls the endpoint with authorization bearer token.
 * @param {string} endpoint
 * @param {string} accessToken
 */
async function callApi(endpoint, requestBody, accessToken) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.timezone="Asia/Shanghai"',
    },
  };

  console.log("request made to web API at: " + new Date().toString());

  try {
    const response = await axios.default.post(endpoint, requestBody, options);
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = {
  callApi: callApi,
};
