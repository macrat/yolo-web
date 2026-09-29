"use client";

import React from "react";
import PhrasedText from "@/components/PhrasedText";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ToolErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <PhrasedText
            as="h2"
            className={styles.heading}
            phrases={["ツールの", "読み込みで", "エラーが", "発生しました"]}
          />
          <p className={styles.text}>
            ページを再読み込みしてください。問題が続く場合は、しばらく時間をおいてからお試しください。
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
