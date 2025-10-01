import React, { useState } from "react";
import "../src/register.css";
import { ethers } from "ethers";
import register from "./utils/whitelistRegister";
import { FaSpinner } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    token: "",
    walletAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Check if MetaMask (or another Ethereum provider) is installed
      if (!window.ethereum) {
        setError("Please install MetaMask to use this feature!");
        setIsLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access if needed
      await provider.send("eth_requestAccounts", []);
      const addresses = await provider.listAccounts();
      
      if (!addresses || addresses.length === 0) {
        throw new Error("No accounts found. Please check your wallet.");
      }
      
      const address = addresses[0].address;
      setIsConnected(true);
      
      // Call the register function
      await register(formData.token);
      
      // On success
      setSuccess("Successfully registered token!");
      setFormData({
        token: "",
        walletAddress: ""
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error.message || "An error occurred while registering. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="token">Token:</label>
          <input
            type="text"
            id="token"
            name="token"
            value={formData.token}
            onChange={handleInputChange}
            placeholder="Enter your token"
            required
          />
        </div>

        {/* <div className="form-group">
          <label htmlFor="walletAddress">Wallet Address:</label>
          <input
            type="text"
            id="walletAddress"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleInputChange}
            placeholder="Enter your wallet address"
            required
          />
        </div> */}

        <button 
          type="submit" 
          className="register-button"
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: isLoading ? '#81c784' : '#4CAF50',
            cursor: isLoading ? 'wait' : 'pointer',
            opacity: isLoading ? 0.8 : 1
          }}
        >
          {isLoading ? (
            <>
              <FaSpinner className="spin" />
              Registering...
            </>
          ) : 'Register'}
        </button>
      </form>
      
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          borderRadius: '4px',
          borderLeft: '4px solid #d32f2f'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '4px',
          borderLeft: '4px solid #2e7d32'
        }}>
          {success}
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
