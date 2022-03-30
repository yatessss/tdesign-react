import React, { forwardRef } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
// import { useLocaleReceiver } from '../locale/LocalReceiver';
import useConfig from '../_util/useConfig';
import { StyledProps } from '../common';
import { TdDateRangePickerProps } from './type';
import { RangeInputPopup } from '../range-input';
import DateRangePanel from './panel/DateRangePanel';
import useRange from './hooks/useRange';
// import { subtractMonth, addMonth, extractTimeObj } from '../_common/js/date-picker/utils-new';

export interface DateRangePickerProps extends TdDateRangePickerProps, StyledProps {}

const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>((props, ref) => {
  const { classPrefix, datePicker: globalDatePickerConfig } = useConfig();

  const {
    className,
    style,
    disabled,
    mode = 'month',
    enableTimePicker,
    disableDate,
    firstDayOfWeek = globalDatePickerConfig.firstDayOfWeek,
    presets,
    timePickerProps,
    format = 'YYYY-MM-DD',
  } = props;

  const {
    inputValue,
    popupVisible,
    rangeInputProps,
    popupProps,
    value,
    year,
    month,
    timeValue,
    activeIndex,
    inputRef,
    setActiveIndex,
    onChange,
    setIsHoverCell,
    setInputValue,
    setPopupVisible,
    setTimeValue,
    formatDate,
    setYear,
    setMonth,
  } = useRange(props);

  // 日期 hover
  function onCellMouseEnter(date: Date) {
    setIsHoverCell(true);

    const nextValue = [...inputValue];
    nextValue[activeIndex] = formatDate(date);
    setInputValue(nextValue);
  }

  // 日期 leave
  function onCellMouseLeave() {
    setIsHoverCell(false);
    setInputValue(formatDate(value));
  }

  // 日期点击
  function onCellClick(date: Date) {
    setIsHoverCell(false);
    const nextValue = [...inputValue];
    nextValue[activeIndex] = formatDate(date, 'valueType');
    onChange(nextValue, nextValue.map(v => dayjs(v)));

    if (!enableTimePicker || nextValue.length < 2 || nextValue.some(v => !dayjs(v).isValid())) return;
    setPopupVisible(false);
  }

  // 头部快速切换
  function onJumperClick(flag: number) {}

  // timepicker 点击
  function onTimePickerChange(val: string) {}

  // 确定
  function onConfirmClick() {}

  // 预设
  function onPresetClick(preset: any) {}

  function onYearChange(year: number) {}

  function onMonthChange(month: number) {}

  const panelProps = {
    value,
    year,
    month,
    mode,
    format,
    presets,
    timeValue,
    disableDate,
    firstDayOfWeek,
    timePickerProps,
    enableTimePicker,
    onCellClick,
    onCellMouseEnter,
    onCellMouseLeave,
    onJumperClick,
    onConfirmClick,
    onPresetClick,
    onYearChange,
    onMonthChange,
    onTimePickerChange,
    // onClick: () => inputRef.current?.focus?.(),
  };

  return (
    <div className={classNames(`${classPrefix}-date-picker`, className)} style={style} ref={ref}>
      <RangeInputPopup
        disabled={disabled}
        inputValue={inputValue}
        popupProps={popupProps}
        rangeInputProps={rangeInputProps}
        popupVisible={popupVisible}
        panel={<DateRangePanel {...panelProps} />}
      />
    </div>
  );
});

DateRangePicker.displayName = 'DateRangePicker';

export default DateRangePicker;
