/**
 * Session Form Hook
 * Manages session time form state and validation
 */

const React = require('react');
const { parseTimeToMinutes } = require('../time');

const DEFAULT_TIMES = {
  amIn: '8:00 AM',
  amOut: '12:00 PM',
  pmIn: '1:00 PM',
  pmOut: '5:00 PM',
};

/**
 * Hook for managing session time form state
 * @param {object} initialValues - Initial form values
 * @returns {object} Form state and handlers
 */
function useSessionForm(initialValues = DEFAULT_TIMES) {
  const [amIn, setAmIn] = React.useState(initialValues.amIn || DEFAULT_TIMES.amIn);
  const [amOut, setAmOut] = React.useState(initialValues.amOut || DEFAULT_TIMES.amOut);
  const [pmIn, setPmIn] = React.useState(initialValues.pmIn || DEFAULT_TIMES.pmIn);
  const [pmOut, setPmOut] = React.useState(initialValues.pmOut || DEFAULT_TIMES.pmOut);
  const [errors, setErrors] = React.useState([]);
  
  const values = React.useMemo(() => ({
    amIn,
    amOut,
    pmIn,
    pmOut,
  }), [amIn, amOut, pmIn, pmOut]);
  
  const setters = React.useMemo(() => ({
    amIn: setAmIn,
    amOut: setAmOut,
    pmIn: setPmIn,
    pmOut: setPmOut,
  }), []);
  
  const handleTimeChange = React.useCallback((field, value) => {
    setters[field](value);
    setErrors([]);
  }, [setters]);
  
  const clearAm = React.useCallback(() => {
    setAmIn('');
    setAmOut('');
    setErrors([]);
  }, []);
  
  const clearPm = React.useCallback(() => {
    setPmIn('');
    setPmOut('');
    setErrors([]);
  }, []);
  
  const resetToDefaults = React.useCallback(() => {
    setAmIn(DEFAULT_TIMES.amIn);
    setAmOut(DEFAULT_TIMES.amOut);
    setPmIn(DEFAULT_TIMES.pmIn);
    setPmOut(DEFAULT_TIMES.pmOut);
    setErrors([]);
  }, []);
  
  const setValues = React.useCallback((newValues) => {
    setAmIn(newValues.amIn || '');
    setAmOut(newValues.amOut || '');
    setPmIn(newValues.pmIn || '');
    setPmOut(newValues.pmOut || '');
    setErrors([]);
  }, []);
  
  const validate = React.useCallback(() => {
    const validationErrors = [];
    const hasAmSession = amIn || amOut;
    const hasPmSession = pmIn || pmOut;
    
    if (!hasAmSession && !hasPmSession) {
      validationErrors.push('At least one session (AM or PM) is required');
      setErrors(validationErrors);
      return false;
    }
    
    if (hasAmSession && (!amIn || !amOut)) {
      validationErrors.push('Both AM in and out times are required');
    }
    
    if (hasPmSession && (!pmIn || !pmOut)) {
      validationErrors.push('Both PM in and out times are required');
    }
    
    if (amIn && amOut) {
      const amInMinutes = parseTimeToMinutes(amIn);
      const amOutMinutes = parseTimeToMinutes(amOut);
      if (amOutMinutes <= amInMinutes) {
        validationErrors.push('AM out must be after AM in');
      }
    }
    
    if (pmIn && pmOut) {
      const pmInMinutes = parseTimeToMinutes(pmIn);
      const pmOutMinutes = parseTimeToMinutes(pmOut);
      if (pmOutMinutes <= pmInMinutes) {
        validationErrors.push('PM out must be after PM in');
      }
    }
    
    if (amOut && pmIn) {
      const amOutMinutes = parseTimeToMinutes(amOut);
      const pmInMinutes = parseTimeToMinutes(pmIn);
      if (pmInMinutes < amOutMinutes) {
        validationErrors.push('PM in must not be earlier than AM out');
      }
    }
    
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }, [amIn, amOut, pmIn, pmOut]);
  
  return {
    values,
    setters,
    handleTimeChange,
    clearAm,
    clearPm,
    resetToDefaults,
    setValues,
    validate,
    errors,
    hasAmSession: !!(amIn || amOut),
    hasPmSession: !!(pmIn || pmOut),
  };
}

module.exports = { useSessionForm, DEFAULT_TIMES };
