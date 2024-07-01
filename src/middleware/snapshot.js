const base = require('../middleware/airtable');
const { fungiblesWalletBalance } = require('../middleware/wallet-info');
const cron = require('node-cron');

async function takeSnapshot(wallet) {

    const userWallet = await base('solanaWallet').select({
        filterByFormula: `{Solana Wallet} = '${wallet}'`,
        maxRecords: 1,
    }).firstPage();

    console.log('Snapshot - user wallet id:', userWallet[0].id);

    // Parse wallet data
    const userWalletBalanceData = fungiblesWalletBalance(wallet);
    const totalBalance = (await userWalletBalanceData).totalWalletBalanceUsdc;
    const solBalance = (await userWalletBalanceData).solanaBalanceUsdc;

    const newSnapshot = await base('snapshots').create([
        {
            "fields": {
                "Solana Wallet": [
                    userWallet[0].id
                ],
                "Total Balance": totalBalance,
                "SOL Balance": solBalance,
            }
        }
    ], function(err, records) {
        if (err) {
          console.error('Error creating snapshot:', err);
          return;
        }
        records.forEach(function (record) {
          console.log('New snapshot was created:', record.getId());
        });
    });

    return newSnapshot;

};

async function scheduleSnapshots() {
    try {

        const allWallets = await base('solanaWallet').select({
            fields: ['Solana Wallet'],
        }).all();

        for (const record of allWallets) {
            const wallet = record.get('Solana Wallet');
            if (wallet != undefined) {
                await takeSnapshot(wallet);
            }
        };

    } catch (err) {
        console.error('Error scheduling snapshots:', err);
    };
};

cron.schedule('0,8,16 * * * *', () => {
    console.log('Starting taking snapshots..');
    scheduleSnapshots();
});

module.exports = {
    takeSnapshot,
};