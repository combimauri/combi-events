export const isWebView = () => {
  const userAgent = navigator.userAgent;

  // Check for common webview patterns
  const webViewPatterns = [
    /FBAN/, // Facebook
    /FBAV/, // Facebook
    /Instagram/, // Instagram
    /Twitter/, // Twitter
    /WebView/, // Generic WebView
    /wv/, // Android WebView
    /iPhone.*Mobile.*Safari/, // iOS WebView
    /Android.*Version\/[\d.]+.*Chrome\/[\d.]+.*Mobile Safari\/[\d.]+/, // Android WebView
  ];

  return webViewPatterns.some((pattern) => pattern.test(userAgent));
};
