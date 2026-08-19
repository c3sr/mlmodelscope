import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import GetApiHelper from "../../../../helpers/api";

const InteractiveExplanationContext = createContext(null);

export function InteractiveExplanationProvider({ artifacts, children }) {
  const api = useMemo(() => GetApiHelper(), []);
  const [selectedArtifact, setSelectedArtifact] = useState(artifacts[0] || null);
  const [expertiseLevel, setExpertiseLevelState] = useState("beginner");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!selectedArtifact || (!selectedArtifact.transient && !artifacts.some((artifact) => artifact.id === selectedArtifact.id)))
      setSelectedArtifact(artifacts[0] || null);
  }, [artifacts, selectedArtifact]);

  const selectArtifact = useCallback((artifact, suggestedQuestion = "") => {
    setSelectedArtifact(artifact);
    setIsOpen(true);
    setQuestion(suggestedQuestion);
    setAnswer(null);
    setStatus("idle");
    setError(null);
  }, []);
  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const setExpertiseLevel = useCallback((level) => {
    setExpertiseLevelState(level);
    setAnswer(null);
    setStatus("idle");
    setError(null);
  }, []);

  const askQuestion = async (event) => {
    event?.preventDefault();
    if (!selectedArtifact || !question.trim()) return;

    setStatus("loading");
    setAnswer(null);
    setError(null);

    try {
      const response = await api.requestInteractiveExplanation({
        context: {
          artifact: {
            kind: selectedArtifact.kind,
            selection: selectedArtifact.selection,
            structuredData: selectedArtifact.structuredData
          },
          model: selectedArtifact.model,
          existingXai: selectedArtifact.existingXai,
          resultContext: selectedArtifact.resultContext,
          textContext: selectedArtifact.textContext
        },
        question: question.trim(),
        expertiseLevel,
        attachments: selectedArtifact.attachments
      });
      setAnswer(response);
      setStatus("success");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  };

  const value = {
    artifacts,
    selectedArtifact,
    setSelectedArtifact,
    selectArtifact,
    isOpen,
    openPanel,
    closePanel,
    expertiseLevel,
    setExpertiseLevel,
    question,
    setQuestion,
    askQuestion,
    answer,
    status,
    error
  };

  return (
    <InteractiveExplanationContext.Provider value={value}>
      {children}
    </InteractiveExplanationContext.Provider>
  );
}

export function useInteractiveExplanation() {
  const context = useContext(InteractiveExplanationContext);
  if (!context)
    throw new Error("useInteractiveExplanation must be used within InteractiveExplanationProvider");
  return context;
}
