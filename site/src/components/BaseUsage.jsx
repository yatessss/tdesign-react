import React, { useEffect, useRef } from 'react';

export default function BaseUsage(props) {
  const { code, configList, onConfigChange, children } = props;
  const usageRef = useRef();

  function handleConfigChange(e) {
    onConfigChange?.(e);
  }

  useEffect(() => {
    usageRef.current.configList = configList;
    usageRef.current.addEventListener('ConfigChange', handleConfigChange);
  }, [configList]);
  
  useEffect(() => {
    usageRef.current.code = code;
  }, [code]);

  return (
    <td-doc-usage ref={usageRef}>
      {children}
    </td-doc-usage>
  );
}
