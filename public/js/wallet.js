document.addEventListener('DOMContentLoaded', async function() {
    const disconnectButton = document.getElementById('disconnectWalletBtn');
    const navbarConnectButton = document.getElementById('connectWalletBtnNavbar');
    const logoutButton = document.getElementById('logoutBtn');

    navbarConnectButton.addEventListener('click', async () => {
        try {
            // Connect to Phantom wallet
            const wallet = await window.solana.connect();
            console.log('Phantom wallet has been connected:', wallet.publicKey.toString());

            // Store wallet connection information in local storage
            localStorage.setItem('walletConnected', 'true');

            // Update UI
            navbarConnectButton.style.display = 'none';
            disconnectButton.style.display = 'inline-block';

        } catch (error) {
            console.error('An error occurred while connecting your wallet:', error);
        }
    });

    disconnectButton.addEventListener('click', async () => {
        try {
            // Disconnect Phantom wallet
            await window.solana.disconnect();
            console.log('Wallet has been disconnected.');

            // Remove wallet connection information from local storage
            localStorage.removeItem('walletConnected');

            // Update UI
            disconnectButton.style.display = 'none';
            navbarConnectButton.style.display = 'inline-block';

        } catch (error) {
            console.error('An error occurred while disconnecting your wallet:', error);
        }
    });

    logoutButton.addEventListener('click', () => {
        try {
            // Disconnect Phantom wallet when logout button is clicked
            window.solana.disconnect();
            console.log('Wallet has been disconnected.');

            // Remove wallet connection information from local storage
            localStorage.removeItem('walletConnected');
        } catch (error) {
            console.error('An error occurred while disconnecting your wallet:', error);
        }
    });

    // Check if wallet is connected on page load
    const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
    if (isWalletConnected) {
        try {
            const wallet = await window.solana.connect();
            console.log('Connected to Phantom wallet:', wallet.publicKey.toString());
        } catch (error) {
            console.error('An error occurred while connecting your wallet:', error);
        }
    }

    // Check if wallet is connected on page load
    if (window.solana.isConnected) {
        navbarConnectButton.style.display = 'none';
        disconnectButton.style.display = 'block';
    } else {
        navbarConnectButton.style.display = 'inline-block';
        disconnectButton.style.display = 'none';
    }

});