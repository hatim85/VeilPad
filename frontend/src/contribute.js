import React, { useState, useEffect } from "react";
import "../src/register.css";
import callMethod from "./utils/callMethod";
import { ethers } from "ethers";
import { FaSpinner } from 'react-icons/fa';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
      token: "",
      walletAddress: "",
      amount: ""
    });
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentAccount, setCurrentAccount] = useState("");

    // Check if wallet is connected on component mount
    useEffect(() => {
        let mounted = true;
        
        const init = async () => {
            if (mounted) {
                await checkIfWalletIsConnected();
            }
        };
        
        init();
        
        // Set up account change listener
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (mounted && accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    setFormData(prev => ({
                        ...prev,
                        walletAddress: accounts[0]
                    }));
                } else if (mounted) {
                    setIsConnected(false);
                    setCurrentAccount("");
                }
            });
        }
        
        return () => {
            mounted = false;
            if (window.ethereum?.removeListener) {
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, []);

    const checkIfWalletIsConnected = async () => {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
            // Only set error if not already set to prevent constant re-renders
            setError(prev => prev || "Please install MetaMask!");
            return false;
        }

        try {
            setIsLoading(true);
            
            // Check if MetaMask is locked
            const isUnlocked = await window.ethereum._metamask?.isUnlocked?.();
            if (isUnlocked === false) {
                setError("Please unlock MetaMask first");
                return false;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();
            
            if (accounts.length > 0) {
                setCurrentAccount(accounts[0].address);
                setIsConnected(true);
                setFormData(prev => ({
                    ...prev,
                    walletAddress: accounts[0].address
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error("Error checking wallet connection:", err);
            if (err.code === -32002) {
                setError("MetaMask is already processing a request. Please check your MetaMask extension.");
            } else {
                setError("Failed to connect to wallet. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const connectWallet = async () => {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
            setError("Please install MetaMask!");
            return;
        }

        // Check if we're on a secure context (https or localhost)
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            setError("Please use HTTPS or localhost for MetaMask to work properly.");
            return;
        }

        try {
            setError("");
            setSuccess("");
            setIsConnecting(true);
            
            // Request account access
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found. Please check your MetaMask wallet.");
            }
            
            setCurrentAccount(accounts[0]);
            setIsConnected(true);
            setFormData(prev => ({
                ...prev,
                walletAddress: accounts[0]
            }));
            setSuccess("Wallet connected successfully!");
        } catch (err) {
            console.error("Error connecting wallet:", err);
            
            // Handle specific error cases
            if (err.code === 4001) {
                setError("Please connect to MetaMask to continue.");
            } else if (err.code === -32002) {
                setError("MetaMask is already processing a request. Please check your MetaMask extension.");
            } else if (err.code === 'UNSUPPORTED_OPERATION') {
                setError("Please install MetaMask or another Web3 provider.");
            } else {
                setError("Failed to connect wallet: " + (err.message || "Unknown error"));
            }
        } finally {
            setIsConnecting(false);
        }
    };
  
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
  
    const handleSubmit = async(e) => {
        e.preventDefault(); 
        
        // Clear previous messages
        setError("");
        
        // Basic validation
        if (!isConnected) {
            setError("Please connect your wallet first");
            return;
        }

        if (!formData.amount || !formData.token) {
            setError("Please fill in all required fields");
            return;
        }

        try {
            setIsLoading(true);
            
            // Store success message in a variable first
            const successMsg = `Successfully contributed ${formData.amount} ${formData.token}!`;
            
            // Make the API call
            await callMethod(formData.amount, currentAccount, formData.token, "contribute");
            
            // Only update success state if the call was successful
            setSuccess(successMsg);
            
            // Reset form on success
            setFormData({
                token: "",
                walletAddress: currentAccount,
                amount: ""
            });
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccess(prev => prev === successMsg ? "" : prev);
            }, 5000);
            
        } catch (err) {
            console.error("Error in form submission:", err);
            setError("Failed to submit form: " + (err.message || "Unknown error"));
            
            // Clear error after 5 seconds
            setTimeout(() => {
                setError("");
            }, 5000);
            
        } finally {
            setIsLoading(false);
        }
    };
  
    return (
    <div className="register-page">
      <h1>Contribute</h1>
      
      {/* Wallet Connection Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
        {!isConnected ? (
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            style={{
              padding: '10px 20px',
              backgroundColor: isConnecting ? '#f8b37c' : '#f6851b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isConnecting ? 'wait' : 'pointer',
              fontSize: '16px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isConnecting ? (
              <>
                <FaSpinner className="spin" />
                Connecting...
              </>
            ) : (
              'Connect MetaMask Wallet'
            )}
          </button>
        ) : (
          <div style={{ 
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '5px',
            wordBreak: 'break-all',
            fontSize: '14px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Connected Wallet:</div>
            <div>{currentAccount}</div>
          </div>
        )}
        
        {error && (
          <div style={{
            color: '#d32f2f',
            marginTop: '10px',
            padding: '12px',
            backgroundColor: '#ffebee',
            borderRadius: '5px',
            fontSize: '14px',
            borderLeft: '4px solid #d32f2f'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            color: '#2e7d32',
            marginTop: '10px',
            padding: '12px',
            backgroundColor: '#e8f5e9',
            borderRadius: '5px',
            fontSize: '14px',
            borderLeft: '4px solid #2e7d32'
          }}>
            {success}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="token">Token Symbol:</label>
          <input
            type="text"
            id="token"
            name="token"
            value={formData.token}
            onChange={handleInputChange}
            placeholder="e.g., DAI, USDC"
            required
            disabled={!isConnected}
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '4px',
              border: '1px solid #ddd',
              opacity: isConnected ? 1 : 0.7
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (ETH):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            required
            disabled={!isConnected}
            min="0"
            step="0.000000000000000001"
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '4px',
              border: '1px solid #ddd',
              opacity: isConnected ? 1 : 0.7
            }}
          />
        </div>

        <button 
          type="submit" 
          className="register-button"
          disabled={!isConnected || isLoading}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '10px',
            backgroundColor: !isConnected ? '#cccccc' : isLoading ? '#81c784' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: !isConnected ? 'not-allowed' : isLoading ? 'wait' : 'pointer',
            opacity: !isConnected ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {!isConnected ? 'Please connect wallet' : isLoading ? (
            <>
              <FaSpinner className="spin" />
              Processing...
            </>
          ) : 'Contribute'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;