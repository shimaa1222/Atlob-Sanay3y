import React, { createContext, useState, useContext } from 'react';

const VerificationContext = createContext();
export const useVerification = () => useContext(VerificationContext);

export const VerificationProvider = ({ children }) => {
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const sendVerificationCode = async (email, userName) => {
    setError('');
    setVerificationStatus('sending');
    await new Promise(r => setTimeout(r, 1500));
    setVerificationStatus('sent');
    setCountdown(60);
    return true;
  };

  const verifyCode = (code) => {
    setError('');
    if (code === '123456') {
      setVerificationStatus('verified');
      return true;
    }
    setError('رمز التحقق غير صحيح');
    return false;
  };

  const resendCode = async () => {
    setError('');
    setVerificationStatus('sending');
    await new Promise(r => setTimeout(r, 1500));
    setVerificationStatus('sent');
    setCountdown(60);
  };

  const clearVerification = () => {
    setVerificationStatus('idle');
    setCountdown(0);
    setError('');
  };

  return (
    <VerificationContext.Provider value={{
      verificationStatus, countdown, error,
      sendVerificationCode, verifyCode, resendCode, clearVerification
    }}>
      {children}
    </VerificationContext.Provider>
  );
};