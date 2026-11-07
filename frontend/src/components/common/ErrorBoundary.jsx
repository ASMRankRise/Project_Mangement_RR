import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#080b16] p-6 text-white">
          <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
            <p className="mt-3 text-sm text-slate-300">
              An unexpected error occurred in the application.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

