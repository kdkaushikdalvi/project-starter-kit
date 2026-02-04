import React, { createContext, useContext, useState } from 'react';

const SignatureContext = createContext(null);

// Field types supported
export const FIELD_TYPES = {
  SIGNATURE: 'signature',
  INITIAL: 'initial',
  DATE: 'date',
};

export function SignatureProvider({ children }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [signatureImage, setSignatureImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [signatures, setSignatures] = useState({});
  const [activeFieldType, setActiveFieldType] = useState(FIELD_TYPES.SIGNATURE);
  const [signerName, setSignerName] = useState(''); // For full name field

  return (
    <SignatureContext.Provider
      value={{
        pdfFile,
        setPdfFile,
        blocks,
        setBlocks,
        signatureImage,
        setSignatureImage,
        currentStep,
        setCurrentStep,
        signatures,
        setSignatures,
        activeFieldType,
        setActiveFieldType,
        signerName,
        setSignerName,
        FIELD_TYPES,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
}

export function useSignature() {
  const ctx = useContext(SignatureContext);
  if (!ctx) throw new Error('useSignature must be used inside SignatureProvider');
  return ctx;
}
