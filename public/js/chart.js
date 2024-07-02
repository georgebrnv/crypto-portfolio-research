let chart;

function initializeLineChart(data) {
    const canvas = document.getElementById('walletBalanceChart');

    // Wallet balance in USDC
    const firstBalance = data[0].totalBalance;
    const lastBalance = data[data.length - 1].totalBalance;

    // Balance change in USDC
    const balanceDifference = (lastBalance - firstBalance).toFixed(2);
    const balanceDifferenceElement = document.getElementById('balance_difference');

     // USDC balance change in percentage
    const percentageDifference = (((lastBalance - firstBalance) / firstBalance) * 100).toFixed(2);
    const percentageDifferenceElement = document.getElementById('percentage_difference');
    percentageDifferenceElement.innerHTML = percentageDifference + '%';

    // Wallet balance in SOL
    const solanaFirstBalance = data[0].solanaBalance;
    const solanaLastBalance = data[data.length - 1].solanaBalance;

    // Balance change in SOL
    const solanaBalanceDifference = (solanaLastBalance - solanaFirstBalance).toFixed(2);
    const solanaBalanceDifferenceElement = document.getElementById('solana_balance_difference');

    // SOL balance change in percentage
    const solanaPercentageDifference = (((solanaLastBalance - solanaFirstBalance) / solanaFirstBalance) * 100).toFixed(2);
    const solanaPercentageDifferenceElement = document.getElementById('solana_percentage_difference');
    solanaPercentageDifferenceElement.innerHTML = solanaPercentageDifference + '%';

    if (solanaPercentageDifference >= 0) {
        solanaBalanceDifferenceElement.innerHTML = '$' + solanaBalanceDifference;
        solanaPercentageDifferenceElement.classList.add('positive');
        solanaPercentageDifferenceElement.classList.remove('negative');
        solanaBalanceDifferenceElement.classList.add('positive');
        solanaBalanceDifferenceElement.classList.remove('negative');
    } else {
        solanaBalanceDifferenceElement.innerHTML = '-$' + Math.abs(solanaBalanceDifference);
        solanaPercentageDifferenceElement.classList.add('negative');
        solanaPercentageDifferenceElement.classList.remove('positive');
        solanaBalanceDifferenceElement.classList.add('negative');
        solanaBalanceDifferenceElement.classList.remove('positive');
    }

    if (percentageDifference >= 0) {
        balanceDifferenceElement.innerHTML = '$' + balanceDifference;

        percentageDifferenceElement.classList.add('positive');
        percentageDifferenceElement.classList.remove('negative');
        balanceDifferenceElement.classList.add('positive');
        balanceDifferenceElement.classList.remove('negative');
    } else {
        balanceDifferenceElement.innerHTML = '-$' + Math.abs(balanceDifference);

        percentageDifferenceElement.classList.add('negative');
        percentageDifferenceElement.classList.remove('positive');
        balanceDifferenceElement.classList.add('negative');
        balanceDifferenceElement.classList.remove('positive');
    }



    const labels = data.map(snapshot => snapshot.timestampDatetime || snapshot.day);
    const datasets = [{
        label: '',
        data: data.map(snapshot => snapshot.totalBalance),
        fill: true,
        borderColor: percentageDifference >= 0 ? 'green' : 'red',
        backgroundColor: createGradient(canvas, percentageDifference >= 0 ? ['rgba(4, 255, 0, 1)', 'rgba(4, 255, 0, 0)'] : ['rgba(231, 0, 0, 1)', 'rgba(231, 0, 0, 0)']),
        tension: 0.1
    }];

    chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    intersect: false,
                },
            },
            animation: {
                duration: 700,
                easing: 'easeInOutElastic',
            },
            scales: {
                x: {
                    display: false,
                },
                y: {
                    display: true,
                }
            },
        }
    });
};

function createGradient(canvas, colors) {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height*4);
    gradient.addColorStop(0, colors[0]); // Start color
    gradient.addColorStop(1, colors[1]); // End color
    return gradient;
};

// Event listeners for switching between charts
document.getElementById('dayBtn').addEventListener('click', function() {
    setActiveButton(this);
    chart.destroy();
    initializeLineChart(walletSnapshotsData['day_1']);
});

document.getElementById('weekBtn').addEventListener('click', function() {
    setActiveButton(this);
    chart.destroy();
    initializeLineChart(walletSnapshotsData['week_1']);
});

document.getElementById('monthBtn').addEventListener('click', function() {
    setActiveButton(this);
    chart.destroy();
    initializeLineChart(walletSnapshotsData['month_1']);
});

document.getElementById('month3Btn').addEventListener('click', function() {
    setActiveButton(this);
    chart.destroy();
    initializeLineChart(walletSnapshotsData['month_3']);
});

document.getElementById('month6Btn').addEventListener('click', function() {
    setActiveButton(this);
    chart.destroy();
    initializeLineChart(walletSnapshotsData['month_6']);
});

document.getElementById('yearBtn').addEventListener('click', function() {
    setActiveButton(this);
    chart.destroy();
    initializeLineChart(walletSnapshotsData['year_1']);
});

window.onload = function() {
    initializeLineChart(walletSnapshotsData['day_1']);
};

function setActiveButton(clickedButton) {
    const buttons = document.querySelectorAll('.chart-btn');
    buttons.forEach(button => {
        button.classList.remove('btn-secondary', 'text-dark');
    });
    clickedButton.classList.add('btn-secondary', 'text-dark');
};