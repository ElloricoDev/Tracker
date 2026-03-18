/**
 * Toast Hook and Context
 * Manages toast notifications state and display
 */

const React = require('react');

const ToastContext = React.createContext({
  showToast: () => {},
  hideToast: () => {},
  toastMessage: '',
  toastType: 'success',
  toastVisible: false,
});

/**
 * Toast Provider Component
 */
function ToastProvider({ children }) {
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState('success');
  const [toastVisible, setToastVisible] = React.useState(false);
  const toastTimeoutRef = React.useRef(null);
  
  const showToast = React.useCallback((message, type = 'success', duration = 2200) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => {
        setToastMessage('');
      }, 300); // Wait for fade out animation
    }, duration);
  }, []);
  
  const hideToast = React.useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastVisible(false);
    setTimeout(() => {
      setToastMessage('');
    }, 300);
  }, []);
  
  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);
  
  const value = React.useMemo(
    () => ({
      showToast,
      hideToast,
      toastMessage,
      toastType,
      toastVisible,
    }),
    [showToast, hideToast, toastMessage, toastType, toastVisible]
  );
  
  return React.createElement(ToastContext.Provider, { value }, children);
}

/**
 * Hook to access toast functionality
 * @returns {object} Toast context with showToast, hideToast, and toast state
 * @example
 * const { showToast } = useToast();
 * showToast('Entry saved successfully!', 'success');
 */
function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

module.exports = { ToastProvider, useToast, ToastContext };
