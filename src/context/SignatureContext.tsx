import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SignatureBlock {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SignatureContextType {
  pdfFile: File | null;
  setPdfFile: React.Dispatch<React.SetStateAction<File | null>>;
  blocks: SignatureBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<SignatureBlock[]>>;
  signatureImage: string | null;
  setSignatureImage: React.Dispatch<React.SetStateAction<string | null>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  signatures: Record<string, string>;
  setSignatures: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const SignatureContext = createContext<SignatureContextType | null>(null);

export function SignatureProvider({ children }: { children: ReactNode }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [blocks, setBlocks] = useState<SignatureBlock[]>([]);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [signatures, setSignatures] = useState<Record<string, string>>({});

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
        setSignatures
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
