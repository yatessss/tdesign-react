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
import { subtractMonth, addMonth, extractTimeObj } from '../_common/js/date-picker/utils-new';

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
    onPick,
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
    // inputRef,
    setActiveIndex,
    onChange,
    setIsHoverCell,
    setInputValue,
    setPopupVisible,
    setTimeValue,
    formatDate,
    setYear,
    setMonth,
    isValidDate,
    isFirstClick,
    setIsFirstClick,
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
    const nextValue = [...inputValue];
    nextValue[activeIndex] = formatDate(value[activeIndex]);
    setInputValue(nextValue);
  }

  // 日期点击
  function onCellClick(date: Date, { e, partial }) {
    onPick?.(date, { e, partial });

    setIsHoverCell(false);
    const nextValue = [...inputValue];
    nextValue[activeIndex] = formatDate(date);
    setInputValue(nextValue);

    if (enableTimePicker) return;

    const notValidIndex = nextValue.findIndex((v) => !v || !isValidDate(v, format, true));

    // 首次点击不关闭、确保两端都有有效值并且无时间选择器时点击后自动关闭
    if (notValidIndex === -1 && nextValue.length === 2 && !enableTimePicker && isFirstClick) {
      setPopupVisible(false);
      setIsFirstClick(false);
      onChange(
        formatDate(nextValue, 'valueType'),
        nextValue.map((v) => dayjs(v)),
      );
    } else {
      setIsFirstClick(true);
      if (notValidIndex !== -1) {
        setActiveIndex(notValidIndex);
      } else {
        setActiveIndex(activeIndex ? 0 : 1);
      }
    }
  }

  // 头部快速切换
  function onJumperClick(flag: number, { partial }) {
    const partialIndex = partial === 'start' ? 0 : 1;

    const monthCountMap = { date: 1, month: 12, year: 120 };
    const monthCount = monthCountMap[mode] || 0;
    const current = new Date(year[partialIndex], month[partialIndex]);

    let next = null;
    if (flag === -1) {
      next = subtractMonth(current, monthCount);
    } else if (flag === 0) {
      next = new Date();
    } else if (flag === 1) {
      next = addMonth(current, monthCount);
    }

    const nextYear = [...year];
    nextYear[partialIndex] = next.getFullYear();
    const nextMonth = [...month];
    nextMonth[partialIndex] = next.getMonth();

    setYear(nextYear);
    setMonth(nextMonth);
  }

  // timepicker 点击
  function onTimePickerChange(val: string) {
    const nextTimeValue = [...timeValue];
    nextTimeValue[activeIndex] = val;
    setTimeValue(nextTimeValue);

    const { hours, minutes, seconds, milliseconds, meridiem } = extractTimeObj(val);
    const currentDate = dayjs(inputValue, format)
      .hour(hours + (/pm/i.test(meridiem) ? 12 : 0))
      .minute(minutes)
      .second(seconds)
      .millisecond(milliseconds)
      .toDate();
    setInputValue(formatDate(currentDate));
  }

  // 确定
  function onConfirmClick() {
    setPopupVisible(false);



    // if (isValidDate(inputValue, format, true)) {
    //   onChange(formatDate(inputValue, 'valueType'), inputValue.map(v => dayjs(v)));
    // } else {
    //   setInputValue(formatDate(value));
    // }
  }

  // 预设
  function onPresetClick(preset: any) {
    let presetValue = preset;
    if (typeof preset === 'function') {
      presetValue = preset();
    }
    if (!Array.isArray(presetValue)) {
      console.error(`preset: ${preset} 预设值必须是数组!`)
    } else {
      setPopupVisible(false);
      onChange(formatDate(presetValue, 'valueType'), presetValue.map(p => dayjs(p)));
    }
  }

  function onYearChange(nextVal: number, { partial }) {
    let partialIndex = partial === 'start' ? 0 : 1;
    if (enableTimePicker) partialIndex = activeIndex;

    const nextYear = [...year];
    nextYear[partialIndex] = nextVal;

    setYear(nextYear);
  }

  function onMonthChange(nextVal: number, { partial }) {
    let partialIndex = partial === 'start' ? 0 : 1;
    if (enableTimePicker) partialIndex = activeIndex;

    const nextMonth = [...month];
    nextMonth[partialIndex] = nextVal;

    setMonth(nextMonth);
  }

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
    activeIndex,
    onCellClick,
    onCellMouseEnter,
    onCellMouseLeave,
    onJumperClick,
    onConfirmClick,
    onPresetClick,
    onYearChange,
    onMonthChange,
    onTimePickerChange,
    // onClick: () => {
    //   inputRef.current?.focus?.({ position: activeIndex ? 'second' : 'first' })
    // },
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
