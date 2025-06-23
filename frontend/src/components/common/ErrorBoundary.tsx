import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service (e.g., Sentry)
      console.error('Production error:', { 
        error: error.message, 
        stack: error.stack, 
        errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-[#ff914d] mb-6">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. Our team has been notified and is working to fix this issue.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#ff914d] text-white py-3 px-4 rounded-lg hover:bg-[#e8823d] transition-colors flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full text-[#104c57] py-2 px-4 rounded-lg hover:bg-[#104c57] hover:text-white transition-colors"
              >
                Try Again
              </button>
            </div>

            {/* Contact Support */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Need immediate help?</p>
              <div className="flex justify-center space-x-4 text-sm">
                <a 
                  href="tel:+919876543210" 
                  className="text-[#ff914d] hover:underline"
                >
                  Call Support
                </a>
                <a 
                  href="mailto:support@luxetimetravel.com" 
                  className="text-[#ff914d] hover:underline"
                >
                  Email Us
                </a>
              </div>
            </div>
            
            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  🔧 Development Error Details
                </summary>
                <div className="mt-3 p-3 bg-red-50 rounded border text-xs">
                  <div className="font-medium text-red-800 mb-2">Error:</div>
                  <div className="text-red-700 mb-3">{this.state.error.message}</div>
                  
                  <div className="font-medium text-red-800 mb-2">Stack Trace:</div>
                  <pre className="text-red-600 whitespace-pre-wrap text-xs overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <div className="font-medium text-red-800 mb-2 mt-3">Component Stack:</div>
                      <pre className="text-red-600 whitespace-pre-wrap text-xs overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}