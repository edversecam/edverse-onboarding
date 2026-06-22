"use client";

import { Component, ReactNode } from "react";

/** Contains a render error in a single block so it can't crash the whole
 *  lesson (editor preview or learner player). */
export class BlockBoundary extends Component<
  { children: ReactNode; label?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prev: { children: ReactNode }) {
    // Recover once the block's content changes (e.g. the author fixes it).
    if (this.state.failed && prev.children !== this.props.children) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="rounded-xl border border-dashed border-danger/40 bg-danger-tint p-4 text-sm text-danger">
          This {this.props.label ?? "block"} couldn&apos;t be displayed — edit
          its content to fix it.
        </div>
      );
    }
    return this.props.children;
  }
}
