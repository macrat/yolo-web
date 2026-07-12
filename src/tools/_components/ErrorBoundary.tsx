"use client";

import React from "react";
import styles from "./ErrorBoundary.module.css";

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
        <div role="alert" className={styles.error}>
          <h2 className={styles.heading}>
            ツールの読み込みでエラーが発生しました
          </h2>
          <p className={styles.text}>
            ページを再読み込みしてください。問題が続く場合は、しばらく時間をおいてからお試しください。
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
