module.exports = {
    responseData: (message = "", result = {}, req, success) => {
        const language = req.headers["accept-language"] ? req.headers["accept-language"] : "en";
        var response = {};
        response.success = success;
        response.message = message
        response.results = result;
        return response;
    }
};
