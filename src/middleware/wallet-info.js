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

        const fungibleTokensData = {};

        // Current SOL price in USDC
        const solana_price = parseFloat(walletData['nativeBalance']['price_per_sol']).toFixed(2);
        // SOL balance in USDC 
        const solana_balance_usdc = parseFloat(walletData['nativeBalance']['total_price']).toFixed(2);
        // SOL balance
        const solana_balance = parseFloat(solana_balance_usdc / solana_price).toFixed(2);

        fungibleTokensData['SOL'] = {
            "token_price": solana_price,
            "token_balance_usdc": solana_balance_usdc,
            "token_balance": solana_balance,
        };
        
        // Current token price in USDC
        let token_price = 0;
        // Token balance in USDC
        let token_balance_usdc = 0;
        // Token balance
        let token_balance = 0;

        // Total wallet balance
        let total_wallet_balance_usdc = Number(solana_balance_usdc);

        for (const token of fungibleTokens) {

            const token_info = token.token_info;
            let tokenSymbol;

            try {

                tokenSymbol = token_info['symbol'];
                if (tokenSymbol && token_info['price_info']) { 

                    token_price = parseFloat(token_info['price_info']['price_per_token']).toFixed(2);
                    token_balance_usdc = parseFloat(token_info['price_info']['total_price']).toFixed(2);
                    token_balance = parseFloat(token_balance_usdc/token_price).toFixed(2);

                    if (token_balance_usdc > 0.01 && token_balance != 'Infinity') {
                        fungibleTokensData[tokenSymbol] = {
                            "token_price": token_price,
                            "token_balance_usdc": token_balance_usdc,
                            "token_balance": token_balance,
                        };

                        total_wallet_balance_usdc += Number(token_balance_usdc);
                    };

                };

            } catch (err) {
                continue;
            };

        };

        // Sort tokens data according to token balance in USDC
        const tokensDataArray = Object.entries(fungibleTokensData);
        tokensDataArray.sort((a, b) => b[1].token_balance_usdc - a[1].token_balance_usdc);
        const sortedTokensData = Object.fromEntries(tokensDataArray);
        
        return { sortedTokensData, total_wallet_balance_usdc };

    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    };

};

module.exports = {
    fungiblesWalletBalance,
};