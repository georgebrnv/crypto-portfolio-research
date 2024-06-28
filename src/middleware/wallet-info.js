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
            'limit': 150,
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
        const walletData = data['result'];
        const fungibleTokens = walletData['items'];

        // Current SOL price
        const solana_price = parseFloat(walletData['nativeBalance']['price_per_sol']).toFixed(2);
        // SOL balance in USDC 
        const solana_balance_usdc = parseFloat(walletData['nativeBalance']['total_price']).toFixed(2);
        // SOL balance
        const solana_balance = parseFloat(solana_balance_usdc / solana_price).toFixed(2);

        console.log('Solana price:', solana_price);
        console.log('Solana balance in USDC:', solana_balance_usdc);
        console.log('Solana holdings:', solana_balance);
        
        for (const token of fungibleTokens) {

            const token_info = token.token_info;
            let tokenSymbol;

            try {

                tokenSymbol = token_info['symbol'];
                if (tokenSymbol && token_info['price_info']) { 
                     
                };

            } catch (err) {
                continue;
            }

            

        };
        
        return data;

    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    };

};

module.exports = {
    fungiblesWalletBalance,
};