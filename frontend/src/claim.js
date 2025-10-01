import React, { useState } from "react";
import "../src/register.css";
import callMethod from "./utils/callMethod";
import { ethers } from "ethers";
import { FaSpinner } from 'react-icons/fa';

const ClaimPage = () => {
    const [formData, setFormData] = useState({
      token: "",
      walletAddress: "",
      amount: ""
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
  
    const handleSubmit = async(e) => {
      e.preventDefault();
      
      // Clear previous messages
      setError("");
      
      try {
        setIsLoading(true);
        
        if (!window.ethereum) {
          throw new Error("Please install MetaMask to use this feature!");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const addresses = await provider.listAccounts();
        
        if (!addresses || addresses.length === 0) {
          throw new Error("No accounts found. Please check your wallet.");
        }
        
        const address = addresses[0].address;
        setIsConnected(true);
        
        // Store success message in a variable first
        const successMsg = `Successfully claimed ${formData.amount} ${formData.token}!`;
        
        // Call the claim method
        await callMethod(formData.amount, address, formData.token, "claim");
        
        // Only update success state if the call was successful
        setSuccess(successMsg);
        
        // Reset form on success
        setFormData({
          token: "",
          walletAddress: "",
          amount: ""
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(prev => prev === successMsg ? "" : prev);
        }, 5000);
        
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        const errorMsg = error.message || "An error occurred while processing your claim. Please try again.";
        setError(errorMsg);
        
        // Clear error after 5 seconds
        setTimeout(() => {
          setError(prev => prev === errorMsg ? "" : prev);
        }, 5000);
        
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="register-page">
        <h1>Claim</h1>
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
            <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Enter the amount that you contributed(in eth)"
            required/>
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
              opacity: isLoading ? 0.8 : 1,
              width: '100%',
              padding: '12px',
              marginTop: '10px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              color: 'white'
            }}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spin" />
                Processing...
              </>
            ) : 'Claim'}
          </button>
        </form>
        
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            borderRadius: '4px',
            borderLeft: '4px solid #d32f2f',
            fontSize: '14px'
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
            borderLeft: '4px solid #2e7d32',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}
      </div>
    );
  };
  
  export default ClaimPage;