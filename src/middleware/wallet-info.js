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
        const solanaPrice = walletData['nativeBalance']['price_per_sol'];
        // SOL balance in USDC 
        const solanaBalanceUsdc = walletData['nativeBalance']['total_price'];
        // SOL balance
        const solanaBalance = solanaBalanceUsdc / solanaPrice;

        fungibleTokensData['SOL'] = {
            "token_price": solanaPrice,
            "token_balance_usdc": solanaBalanceUsdc,
            "token_balance": solanaBalance,
        };
        
        // Current token price in USDC
        let tokenPrice = 0;
        // Token balance in USDC
        let tokenBalanceUsdc = 0;
        // Token balance
        let tokenBalance = 0;

        // Token Biggest position
        let tokenBiggestPositionUsdc = solanaBalanceUsdc;
        let tokenBiggestPositionSymbol = 'SOL';

        // Total wallet balance
        let totalWalletBalanceUsdc = solanaBalanceUsdc;

        for (const token of fungibleTokens) {

            const tokenInfo = token.token_info;
            let tokenSymbol;

            try {

                tokenSymbol = tokenInfo['symbol'];
                if (tokenSymbol && tokenInfo['price_info']) { 

                    tokenPrice = tokenInfo['price_info']['price_per_token'];
                    tokenBalanceUsdc = tokenInfo['price_info']['total_price'];
                    tokenBalance = tokenBalanceUsdc / tokenPrice;


                    if (tokenBalanceUsdc > 0.01 && tokenBalance != Infinity) {

                        fungibleTokensData[tokenSymbol] = {
                            "token_price": tokenPrice,
                            "token_balance_usdc": tokenBalanceUsdc,
                            "token_balance": tokenBalance,
                        };

                        if (tokenBalanceUsdc > tokenBiggestPositionUsdc) {
                            tokenBiggestPositionUsdc = tokenBalanceUsdc;
                            tokenBiggestPositionSymbol = tokenSymbol;
                        };
                        
                    };

                    totalWalletBalanceUsdc += tokenBalanceUsdc;
                };
                

            } catch (err) {
                continue;
            };

        };

        // Sort tokens data according to token balance in USDC
        const tokensDataArray = Object.entries(fungibleTokensData);
        tokensDataArray.sort((a, b) => b[1].tokenBalanceUsdc - a[1].tokenBalanceUsdc);
        const sortedTokensData = Object.fromEntries(tokensDataArray);
        
        return { 
            sortedTokensData, 
            totalWalletBalanceUsdc, 
            solanaBalanceUsdc, 
            solanaBalance, 
            tokenBiggestPositionUsdc, 
            tokenBiggestPositionSymbol,
        };

    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    };

};

module.exports = {
    fungiblesWalletBalance,
};