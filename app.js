const articleMap = {};

window.addEventListener('DOMContentLoaded', () => {
    const contractAddress = "0x49c21c226c9a92b4390e4aa8c313466f427272cc"; // Contract Address
    const contractABI =
    [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_header",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_body",
                    "type": "string"
                }
            ],
            "name": "addArticle",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "articleIndex",
                    "type": "uint256"
                }
            ],
            "name": "donateToAuthor",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "header",
                    "type": "string"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "author",
                    "type": "address"
                }
            ],
            "name": "ArticleAdded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "articleIndex",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "donor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "authorShare",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "creatorShare",
                    "type": "uint256"
                }
            ],
            "name": "DonationMade",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "articles",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "header",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "body",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "author",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "creatorAddress",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_count",
                    "type": "uint256"
                }
            ],
            "name": "getRecentArticles",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "string",
                            "name": "header",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "body",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "author",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct NewsContract.NewsArticle[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const connectButton = document.getElementById('connectButton');
    const status = document.getElementById('status');
    const newsList = document.getElementById('news-list');
    const writeButton = document.getElementById('writeButton');
    const writePopup = document.getElementById('writePopup');
    const closeWritePopup = document.getElementById('closeWritePopup');
    const aboutButton = document.getElementById('aboutButton');
    const okButton = document.getElementById('okButton');
    const aboutPopup = document.getElementById('aboutPopup');
    const closePopup = document.getElementById('closePopup');
    const loadingPopup = document.getElementById('loadingPopup'); // Popup for "Please Wait"

    const now = new Date();

    const day = now.getUTCDate();
    const month = now.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = now.getUTCFullYear();
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const seconds = now.getUTCSeconds();

    let zuluTime = ""; // Define a global variable
    
    function updateZuluTime() {
        const now = new Date();
    
        // Map for month names
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
        // Extract parts of the date
        const year = now.getUTCFullYear();
        const month = monthNames[now.getUTCMonth()];
        const day = now.getUTCDate();
        const hours = now.getUTCHours().toString().padStart(2, '0');
        const minutes = now.getUTCMinutes().toString().padStart(2, '0');
        const seconds = now.getUTCSeconds().toString().padStart(2, '0');
    
        // Format the date and time
        zuluTime = `${month} ${day} ${year} ${hours}:${minutes}:${seconds} UTC`;
    
        // Display the formatted time
        document.getElementById('zulu-time').textContent = zuluTime;
    }
    
    // Update time every second
    setInterval(updateZuluTime, 1000);
    
    // Initialize the time display immediately
    updateZuluTime();   

    async function loadArticles() {
        const provider = new ethers.providers.JsonRpcProvider("https://rpc.soniclabs.com");
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
        try {
            // Fetch all articles
            const allArticles = await contract.getRecentArticles(50); // Fetch up to 100,000 articles
            newsList.innerHTML = '';
    
            // Determine how many articles to display
            const displayLimit = 30; // Display only the most recent 30 articles
            const totalArticles = allArticles.length;
    
            // Render only the most recent 30 articles
            for (let i = totalArticles - 1; i >= Math.max(0, totalArticles - displayLimit); i--) {
                const article = allArticles[i];
                const originalIndex = i; // Use the index from the full list as the original index
    
                const item = document.createElement('div');
                item.className = 'news-item';
                item.id = `article-${originalIndex}`; // Use original index for unique ID
    
                const link = document.createElement('a');
                link.textContent = article.header;
                link.href = `?article=${originalIndex}`; // Use original index for permalinks
    
                const bodyDiv = document.createElement('div');
                bodyDiv.className = 'news-body';
                bodyDiv.innerHTML = `
                    <p><center><strong>Author: </strong>${article.author}</center></p>
                    <p>${article.body.replace(/\n/g, '<br>')}</p>`;
                bodyDiv.style.display = 'none';
    
                // Create buttons
                const donateButton = document.createElement('button');
                donateButton.textContent = "Donate to Author";
                donateButton.classList.add('donate-button');
                donateButton.style.display = 'none';
    
                const tweetButton = document.createElement('button');
                tweetButton.textContent = "Post on X";
                tweetButton.classList.add('tweet-button');
                tweetButton.style.display = 'none';
                tweetButton.style.marginLeft = "8px";
    
                const copyButton = document.createElement('button');
                copyButton.textContent = "Copy URL";
                copyButton.classList.add('copy-button');
                copyButton.style.display = 'none';
                copyButton.style.marginLeft = "8px";
    
                // Add button functionality
                donateButton.addEventListener('click', async () => {
                    const amount = prompt("Enter the donation amount in POL:");
                    if (amount && parseFloat(amount) > 0) {
                        await handleDonation(originalIndex, ethers.utils.parseEther(amount));
                    }
                });
    
                tweetButton.addEventListener('click', () => {
                    const articleUrl = `${window.location.origin}/?article=${originalIndex}`;
                    const tweetText = encodeURIComponent(`${article.header} ${articleUrl}`);
                    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
                    window.open(tweetUrl, '_blank');
                });
    
                copyButton.addEventListener('click', () => {
                    const articleUrl = `${window.location.origin}/?article=${originalIndex}`;
                    navigator.clipboard.writeText(articleUrl)
                        .then(() => alert("URL copied to clipboard!"))
                        .catch((error) => console.error("Failed to copy URL:", error));
                });
    
                // Append elements to the item
                item.appendChild(link);
                item.appendChild(bodyDiv);
                item.appendChild(donateButton);
                item.appendChild(tweetButton);
                item.appendChild(copyButton);
                newsList.appendChild(item);
    
                // Toggle visibility of the article and buttons
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isVisible = bodyDiv.style.display === "none";
                    bodyDiv.style.display = isVisible ? "block" : "none";
                    donateButton.style.display = isVisible ? "inline-block" : "none";
                    tweetButton.style.display = isVisible ? "inline-block" : "none";
                    copyButton.style.display = isVisible ? "inline-block" : "none";
                });
            }
    
            // Handle URL parameters for specific articles
            const urlParams = new URLSearchParams(window.location.search);
            const articleIndex = urlParams.get('article');
            if (articleIndex !== null) {
                const specificArticle = document.getElementById(`article-${articleIndex}`);
                if (specificArticle) {
                    const link = specificArticle.querySelector('a');
                    link.click(); // Simulate click to show the article
                    specificArticle.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error("Error loading articles:", error);
            status.textContent = 'Failed to load articles.';
        }
    }

    const donateButton = document.getElementById('donateButton');

    donateButton.addEventListener('click', async () => {
        const donationAddress = "0x660B4AC6c45D8d710d14735B005835754BBbAFB8"; // The donation address
        const amount = prompt("Enter the donation amount in SONIC:");

        if (amount && parseFloat(amount) > 0) {
            try {
                if (typeof window.ethereum !== 'undefined') {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();

                    const tx = {
                        to: donationAddress,
                        value: ethers.utils.parseEther(amount),
                    };

                    loadingPopup.style.display = 'block'; // Show "Please Wait" popup

                    const transaction = await signer.sendTransaction(tx);
                    alert("Thank you for your donation! Transaction is being processed.");
                    await transaction.wait();

                    alert("Donation successful!");
                } else {
                    alert("MetaMask is not installed. Please install it to make a donation.");
                }
            } catch (error) {
                console.error("Donation failed:", error);
                alert("Failed to process the donation. Please try again.");
            } finally {
                loadingPopup.style.display = 'none'; // Hide "Please Wait" popup
            }
        } else {
            alert("Invalid amount. Please enter a valid donation amount.");
        }
    });

    async function switchToSonic() {
        const SonicNetwork = {
            chainId: '0x92', // Hexadecimal for 10
            chainName: 'Sonic',
            nativeCurrency: {
                name: 'Sonic',
                symbol: 'S',
                decimals: 18,
            },
            rpcUrls: ['https://rpc.soniclabs.com'], // Official Optimism RPC endpoint
            blockExplorerUrls: ['https://sonicscan.org/'], // Optimism's block explorer
        };
        
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Try to switch to Sonic network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SonicNetwork.chainId }],
                });
                console.log("Switched to Sonic network");
            } catch (error) {
                // If the network is not added to MetaMask, add it
                if (error.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [SonicNetwork],
                        });
                        console.log("Sonic network added to MetaMask");
                    } catch (addError) {
                        console.error("Failed to add Sonic network to MetaMask:", addError);
                    }
                } else {
                    console.error("Failed to switch to Sonic network:", error);
                }
            }
        } else {
            alert("MetaMask is not installed. Please install MetaMask to proceed.");
        }
    }

    async function handleDonation(articleIndex, amount) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await contract.donateToAuthor(articleIndex, { value: amount });
            loadingPopup.style.display = 'block'; // Show "Please Wait" popup
            await tx.wait();

            alert("Donation successful! 90% to the author, 10% to the site.");
        } catch (error) {
            console.error("Donation failed:", error);
            alert("Failed to process the donation. Please try again.");
        } finally {
            loadingPopup.style.display = 'none'; // Hide "Please Wait" popup
        }
    }

    connectButton.addEventListener('click', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                await switchToSonic(); // Ensure the user is on Sonic network
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.listAccounts();
                status.textContent = `Connected with: ${accounts[0]}`;
            } catch (error) {
                console.error(error);
                status.textContent = 'Connection failed. Please try again.';
            }
        } else {
            status.textContent = 'MetaMask is not installed. Please install it to proceed.';
        }
    });

    writeButton.addEventListener('click', () => writePopup.style.display = 'block');
    closeWritePopup.addEventListener('click', () => writePopup.style.display = 'none'); 

        document.getElementById('writeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const header = document.getElementById('header').value;
            const body = document.getElementById('body').value;
            const newBody = `${zuluTime}\n\n${body}`;

            if (!header || !body) {
                alert("Please fill in both fields.");
                return;
            }

            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(contractAddress, contractABI, signer);

                const tx = await contract.addArticle(header, newBody);
                loadingPopup.style.display = 'block'; // Show "Please Wait" popup
                await tx.wait();

                alert("Article submitted successfully!");
                writePopup.style.display = 'none';
                loadArticles();
            } catch (error) {
                console.error("Failed to submit article:", error);
                alert("Failed to submit the article. Please try again.");
            } finally {
                loadingPopup.style.display = 'none'; // Hide "Please Wait" popup
            }
        });

    aboutButton.addEventListener('click', () => aboutPopup.style.display = 'block');
    okButton.addEventListener('click', () => aboutPopup.style.display = 'none');
    closePopup.addEventListener('click', () => aboutPopup.style.display = 'none');

    loadArticles();
});

