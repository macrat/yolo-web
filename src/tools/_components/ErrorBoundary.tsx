"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ToolErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            padding: "1.5rem",
            border: "1px solid var(--color-error, #dc3545)",
            borderRadius: "0.5rem",
            backgroundColor: "var(--color-error-bg, #fff5f5)",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            ツールの読み込みでエラーが発生しました
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            ページを再読み込みしてください。問題が続く場合は、しばらく時間をおいてからお試しください。
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
