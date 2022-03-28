import React, { FC, useState } from 'react';
import classNames from 'classnames';

import { TimeIcon } from 'tdesign-icons-react';
import noop from '../_util/noop';
import useDefaultValue from '../_util/useDefaultValue';
import useConfig from '../_util/useConfig';
import { RangeInputPopup } from '../range-input';
import TimeRangePickerPanel from './panel/TimePickerRangePanel';

import { useTimePickerTextConfig } from './const';

import { TdTimeRangePickerProps } from './type';
import { StyledProps } from '../common';

export interface TimeRangePickerProps extends TdTimeRangePickerProps, StyledProps {}

const TimeRangePicker: FC<TimeRangePickerProps> = (props) => {
  const TEXT_CONFIG = useTimePickerTextConfig();

  const {
    // allowInput,
    clearable,
    disabled,
    format = 'HH:mm:ss',
    hideDisabledTime = true,
    placeholder = TEXT_CONFIG.placeholder,
    // size = 'medium',
    steps = [1, 1, 1],
    value,
    onBlur = noop,
    onChange,
    onFocus = noop,
    // onInput = noop,
    style,
    // className,
  } = useDefaultValue(props);

  const { classPrefix } = useConfig();

  const name = `${classPrefix}-time-picker`;

  const [isPanelShowed, setPanelShow] = useState(false);

  const inputClasses = classNames(`${name}__group`, {
    [`${classPrefix}-is-focused`]: isPanelShowed,
  });

  const handleShowPopup = (visible: boolean) => {
    setPanelShow(visible);
  };

  const handleClear = (context: { e: React.MouseEvent }) => {
    const { e } = context;
    e.stopPropagation();
    onChange(null);
  };

  return (
    <RangeInputPopup
      style={style}
      disabled={disabled}
      popupVisible={isPanelShowed}
      onPopupVisibleChange={handleShowPopup}
      rangeInputProps={{
        clearable,
        className: inputClasses,
        value: value ?? undefined,
        placeholder: !value ? placeholder : undefined,
        suffixIcon: <TimeIcon />,
        onClear: handleClear,
        onBlur,
        onFocus,
      }}
      panel={
        <TimeRangePickerPanel
          steps={steps}
          format={format}
          hideDisabledTime={hideDisabledTime}
          isFooterDisplay={true}
          value={value}
          onChange={onChange}
          handleConfirmClick={(value) => {
            onChange(value);
            setPanelShow(false);
          }}
        />
      }
    />
  );
};

TimeRangePicker.displayName = 'TimeRangePicker';

export default TimeRangePicker;
