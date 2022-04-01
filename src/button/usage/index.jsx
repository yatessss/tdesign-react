// @ts-nocheck
import React, { useState } from 'react';
import BaseUsage from '@site/src/components/BaseUsage';
import { Button } from 'tdesign-react';
import jsxToString from 'jsx-to-string';

const configList = [
  { name: 'disabled', defaultValue: false, type: 'boolean' },
  {
    name: 'theme',
    type: 'enum',
    defaultValue: 'default',
    options: [
      { label: 'default', value: 'default' },
      { label: 'primary', value: 'primary' },
      { label: 'danger', value: 'danger' },
      { label: 'warning', value: 'warning' },
      { label: 'success', value: 'success' },
    ],
  },
];

export default function Usage() {
  const defaultProps = configList.reduce((prev, curr) => {
    if (curr.defaultValue) Object.assign(prev, { [curr.name]: curr.defaultValue });
    return prev;
  }, {});

  const defaultMockProps = {};
  const [changedProps, setChangedProps] = useState(defaultProps);

  function onConfigChange(e) {
    const { name, value } = e.detail;
    setChangedProps({ ...changedProps, [name]: value });
  }

  const baseComp = <Button {...defaultMockProps}>确定</Button>;

  const renderComp = React.cloneElement(baseComp, { ...changedProps });
  const jsxStr = jsxToString(renderComp);

  return (
    <BaseUsage code={jsxStr} configList={configList} onConfigChange={onConfigChange}>
      {renderComp}
    </BaseUsage>
  );
}
