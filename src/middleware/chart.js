const base = require('../middleware/airtable');

async function balanceChart(wallet) {

    try {
        const allSnapshots = await base('snapshots').select({
            filterByFormula: `{Solana Wallet} = '${wallet}'`,
        }).all();

        // Sort snapshots by Date field in ascending order
        allSnapshots.sort((a, b) => new Date(a.fields['Date']) - new Date(b.fields['Date']));

        const userSnapshotsData = {
            day_1: [],
            week_1: [],
            month_1: [],
            month_3: [],
            month_6: [],
            year_1: []
        };

        let lastDaySnapshotDate = null;
        let lastWeekSnapshotDate = null;
        let lastMonthSnapshotDate = null;
        let lastHalfYearSnapshotDate = null;
        let lastYearSnapshotDate = null;

        const now = new Date();

        for (const record of allSnapshots) {

            const timestampDatetime = new Date(record.fields['Date']);
            const totalBalance = record.fields['Total Balance'];
            const solanaBalance = record.fields['SOL Balance'];

            // Time difference in ms
            const timeDifferenceInMs = now - timestampDatetime;
            // Time difference in days
            const timeDifferenceInDays = timeDifferenceInMs / (1000 * 60 * 60 * 24);

            const dailySnapshot = {
                timestampDatetime: timestampDatetime.toLocaleString(),
                totalBalance: totalBalance,
                solanaBalance: solanaBalance
            };
            const snapshot = {
                day: timestampDatetime.toLocaleDateString(),
                totalBalance: totalBalance,
                solanaBalance: solanaBalance
            };

            if (timeDifferenceInDays <= 1) {
                userSnapshotsData.day_1.push(dailySnapshot);
            }
            if (timestampDatetime.toDateString() !== lastDaySnapshotDate && timeDifferenceInDays <= 7) {
                userSnapshotsData.week_1.push(snapshot);
                lastDaySnapshotDate = timestampDatetime.toDateString();
            }
            if (timestampDatetime.toDateString() !== lastWeekSnapshotDate && timeDifferenceInDays <= 30) {
                userSnapshotsData.month_1.push(snapshot);
                lastWeekSnapshotDate = timestampDatetime.toDateString();
            }
            if (timestampDatetime.toDateString() !== lastMonthSnapshotDate && timeDifferenceInDays <= 90) {
                userSnapshotsData.month_3.push(snapshot);
                lastMonthSnapshotDate = timestampDatetime.toDateString();
            }
            if (timestampDatetime.toDateString() !== lastHalfYearSnapshotDate && timeDifferenceInDays <= 180) {
                userSnapshotsData.month_6.push(snapshot);
                lastHalfYearSnapshotDate = timestampDatetime.toDateString();
            }
            if (timestampDatetime.toDateString() !== lastYearSnapshotDate && timeDifferenceInDays <= 365) {
                userSnapshotsData.year_1.push(snapshot);
                lastYearSnapshotDate = timestampDatetime.toDateString();
            }

        };

        return userSnapshotsData;

    } catch (err) {
        console.error('Error getting balance change info:', err);
        return null;
    };

};

module.exports = {
    balanceChart,
};