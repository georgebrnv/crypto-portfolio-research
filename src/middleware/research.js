const axios = require("axios");
require('dotenv').config();

async function generateNote(token) {

    const newsapiResponse = await axios.get(`https://newsapi.org/v2/everything?q=Crypto$${token}&apiKey=${process.env.NEWSAPI_API_KEY}`);
    const articles = newsapiResponse.data.articles;

    if (articles.length > 0) {
        return articles;
    };
    return null
};

module.exports = {
    generateNote,
};