"use client";

import React from "react";

interface PipelineProgressProps {
  currentStep: number; // 0 = none, 1 = search, 2 = parse, 3 = compile
}

const steps = [
  { num: 1, label: "Search" },
  { num: 2, label: "Parse" },
  { num: 3, label: "Compile" },
];

export default function PipelineProgress({
  currentStep,
}: PipelineProgressProps) {
  return (
    <div className="pipeline-track">
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <React.Fragment key={step.num}>
            {i > 0 && (
              <div
                className={`pipeline-connector${
                  isCompleted ? " completed" : isActive ? " active" : ""
                }`}
              />
            )}
            <div
              className={`pipeline-step${
                isCompleted ? " completed" : isActive ? " active" : ""
              }`}
            >
              <span className="step-num">
                {isCompleted ? "✓" : step.num}
              </span>
              <span>{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
