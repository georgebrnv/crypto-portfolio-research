const fetch = require('node-fetch');
require('dotenv').config();

async function fungiblesWalletBalance(wallet) {

    const apiKey = process.env.HELIUS_API_KEY;
    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  
    const requestBody = {
        jsonrpc: "2.0",
        id: "my-id",
        method: "searchAssets",
        'params': {
            'ownerAddress': wallet,
            'page': 1,
            'limit': 10,
            'tokenType': 'fungible',
            'displayOptions': {
                'showUnverifiedCollections': false,
                'showCollectionMetadata': false,
                'showGrandTotal': true,
                'showNativeBalance': true,
                'showInscription': true,
                'showZeroBalance': false,
                'showRawData': false,
            }
        },
    };
  
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Assets:', data['result']['items']);
        return data;

    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    };

};

module.exports = {
    fungiblesWalletBalance,
};