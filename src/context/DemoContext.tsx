import React, { createContext, useContext, useState } from 'react';

export interface DemoStep {
  id: number;
  title: string;
  module: string;
  description: string;
  targetPath: string;
  targetProjectId?: string;
  highlightText: string;
}

export const SIH_DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'Platform Role & Executive Overview',
    module: 'dashboard',
    description: 'Welcome to BHOOMI SETU. As a Government Official / Policymaker, inspect national statistics across 1,248 active projects, 2.8M land parcels, and 187 high-risk projects.',
    targetPath: 'dashboard',
    highlightText: 'Key statistics: 187 Projects at Risk across India.'
  },
  {
    id: 2,
    title: 'GIS Land Intelligence & Hotspot Map',
    module: 'gis',
    description: 'Navigate to the GIS map to visualize active layers (Land Use, Infrastructure, Forest, Risk Zones) and select the high-risk Chhattisgarh Highway corridor.',
    targetPath: 'gis',
    targetProjectId: 'proj-cg-01',
    highlightText: 'Click on the red marker in Raigarh, Chhattisgarh.'
  },
  {
    id: 3,
    title: 'Project Deep-Dive: Raigarh-Surguja Highway',
    module: 'projects',
    description: 'Examine project progress (48.9% acquired), compensation breakdown (46.6% disbursed), and 18 High Court stay proceedings.',
    targetPath: 'projects',
    targetProjectId: 'proj-cg-01',
    highlightText: 'Notice compensation disbursement gap of ₹240.4 Cr.'
  },
  {
    id: 4,
    title: 'Predictive ML Delay Analytics',
    module: 'predictive',
    description: 'Evaluate the ML Risk Score (78/100 HIGH RISK) and 72% delay probability with automated root cause breakdown and recommended interventions.',
    targetPath: 'predictive',
    targetProjectId: 'proj-cg-01',
    highlightText: 'Automated delay prediction: 8.5 months estimated delay.'
  },
  {
    id: 5,
    title: 'BHOOMI AI RAG Assistant',
    module: 'ai',
    description: 'Ask BHOOMI AI why land acquisition projects are delayed and receive grounded responses with research & policy clause citations.',
    targetPath: 'ai',
    highlightText: 'Grounded RAG answers with citations to research documents.'
  },
  {
    id: 6,
    title: 'Research Hub & AI Summarizer',
    module: 'research',
    description: 'Explore 12,450+ indexed land governance papers and trigger instant AI Research Summarization for key findings and policy implications.',
    targetPath: 'research',
    highlightText: 'AI Summarizer extracts findings, stats, and methodology.'
  },
  {
    id: 7,
    title: 'Policy Lab Scenario Simulator',
    module: 'policylab',
    description: 'Simulate raising compensation multipliers from 1.2x to 1.8x in high-litigation zones and watch predicted delay drop from 18.5 months to 10.2 months in real-time.',
    targetPath: 'policylab',
    highlightText: 'Real-time interactive impact simulation graphs.'
  }
];

interface DemoContextType {
  isDemoActive: boolean;
  currentStepIndex: number;
  startDemo: () => void;
  stopDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  currentStep: DemoStep;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{
  children: React.ReactNode;
  onNavigate?: (path: string, projectId?: string) => void;
}> = ({ children, onNavigate }) => {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startDemo = () => {
    setIsDemoActive(true);
    setCurrentStepIndex(0);
    const step = SIH_DEMO_STEPS[0];
    if (onNavigate) onNavigate(step.targetPath, step.targetProjectId);
  };

  const stopDemo = () => {
    setIsDemoActive(false);
  };

  const nextStep = () => {
    if (currentStepIndex < SIH_DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const step = SIH_DEMO_STEPS[nextIdx];
      if (onNavigate) onNavigate(step.targetPath, step.targetProjectId);
    } else {
      setIsDemoActive(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const step = SIH_DEMO_STEPS[prevIdx];
      if (onNavigate) onNavigate(step.targetPath, step.targetProjectId);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoActive,
        currentStepIndex,
        startDemo,
        stopDemo,
        nextStep,
        prevStep,
        currentStep: SIH_DEMO_STEPS[currentStepIndex]
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
