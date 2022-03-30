import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalendarIcon } from 'tdesign-icons-react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import useConfig from '../../_util/useConfig';
import useDefault from '../../_util/useDefault';
import { RangeInputRefInterface } from '../../range-input';
import { TdDateRangePickerProps, DateValue } from '../type';
import useFormat from './useFormat';

export const PARTIAL_MAP = { first: 'start', second: 'end' };

// 初始化面板年份月份
function initYearMonthTime(value: DateValue[], mode = 'month', timeFormat = 'HH:mm:ss') {
  const defaultYearMonth = {
    year: [dayjs().year(), dayjs().year()],
    month: [dayjs().month(), dayjs().month()],
    time: [dayjs().format(timeFormat), dayjs().format(timeFormat)],
  };
  if (mode === 'year') {
    defaultYearMonth.year[1] += 10;
  } else if (mode === 'month') {
    defaultYearMonth.year[1] += 1;
  } else if (mode === 'date') {
    defaultYearMonth.month[1] += 1;
  }

  if (!Array.isArray(value) || !value.length) {
    return defaultYearMonth;
  }

  return {
    year: value.map((v) => dayjs(v).year() || dayjs().year()),
    month: value.map((v) => dayjs(v).month() || dayjs().month()),
    time: value.map((v) => dayjs(v).format(timeFormat)),
  };
}

export default function useRange(props: TdDateRangePickerProps) {
  const { classPrefix, datePicker: globalDatePickerConfig } = useConfig();
  const name = `${classPrefix}-date-range-picker`;

  const inputRef = useRef<RangeInputRefInterface>();

  const {
    mode = 'month',
    value: valueFromProps,
    defaultValue: defaultValueFromProps = [],
    onChange: onChangeFromProps,
    prefixIcon,
    suffixIcon,
    rangeInputProps: rangeInputPropsFromProps,
    popupProps: popupPropsFromProps,
    allowInput = true,
    clearable = true,
    format = 'YYYY-MM-DD',
    placeholder = globalDatePickerConfig.placeholder[mode],
    onBlur,
    onFocus,
    onInput,
  } = props;

  const [value, onChange] = useDefault(valueFromProps, defaultValueFromProps, onChangeFromProps);
  const { isValidDate, timeFormat, formatDate, getFullFormat } = useFormat({ ...props, value });

  // warning invalid value
  if (!Array.isArray(value)) {
    console.error(`typeof value: ${value} must be Array!`);
  } else if (!isValidDate(value)) {
    console.error(`value: ${value} is invalid datetime!`);
  }

  // 未真正选中前可能不断变更输入框的内容
  const [inputValue, setInputValue] = useState(formatDate(value));
  // 选择阶段预选状态
  // const [cacheValue, setCacheValue] = useState(value);

  const [popupVisible, setPopupVisible] = useState(false);
  const [isHoverCell, setIsHoverCell] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // 确定当前选中的输入框序号
  const [isFirstClick, setIsFirstClick] = useState(false); // 记录面板点击次数，两次后才自动关闭
  const [timeValue, setTimeValue] = useState(initYearMonthTime(value, mode, timeFormat).time);
  const [month, setMonth] = useState(initYearMonthTime(value, mode).month);
  const [year, setYear] = useState(initYearMonthTime(value, mode).year);

  // input 设置
  const rangeInputProps = useMemo(
    () => ({
      ...rangeInputPropsFromProps,
      ref: inputRef,
      clearable,
      prefixIcon,
      readonly: !allowInput,
      placeholder,
      suffixIcon: suffixIcon || <CalendarIcon />,
      className: classNames({
        [`${name}__input--placeholder`]: isHoverCell,
      }),
      onClear: ({ e }) => {
        e.stopPropagation();
        setPopupVisible(false);
        onChange([], []);
      },
      onBlur: (newVal: string[], { e, position }) => {
        onBlur?.({ value: newVal, partial: PARTIAL_MAP[position], e });
        if (!isValidDate(newVal, format, true)) {
          setInputValue(formatDate(value));
        }
      },
      onFocus: (newVal: string[], { e, position }) => {
        onFocus?.({ value: newVal, partial: PARTIAL_MAP[position], e });
        setActiveIndex(position === 'first' ? 0 : 1);
      },
      onChange: (newVal: string[], { e, position }) => {
        const index = position === 'first' ? 0 : 1;

        onInput?.({ input: newVal[index], value, partial: PARTIAL_MAP[position], e });
        setInputValue(newVal);

        const fullFormat = getFullFormat();
        // 跳过不符合格式化的输入框内容
        if (!isValidDate(newVal, fullFormat, true)) return;
        const newYear = [];
        const newMonth = [];
        const newTime = [];
        newVal.forEach((v, i) => {
          newYear.push(dayjs(v).year() || year[i]);
          newMonth.push(dayjs(v).month() || month[i]);
          newTime.push(dayjs(v).format(timeFormat) || timeValue[i]);
        });
        setYear(newYear);
        setMonth(newMonth);
        setTimeValue(newTime);
      },
      onEnter: (newVal: string[]) => {
        if (!isValidDate(newVal) && !isValidDate(value)) return;

        setPopupVisible(false);
        if (isValidDate(newVal, format, true)) {
          onChange(formatDate(newVal, 'valueType') as DateValue[], newVal.map(v => dayjs(v)));
        } else if (isValidDate(value)) {
          setInputValue(formatDate(value));
        } else {
          setInputValue([]);
        }
      },
    }),
    [
      name,
      allowInput,
      suffixIcon,
      clearable,
      prefixIcon,
      placeholder,
      formatDate,
      onBlur,
      onInput,
      onFocus,
      onChange,
      value,
      format,
      rangeInputPropsFromProps,
      isHoverCell,
      getFullFormat,
      timeFormat,
      month,
      year,
      timeValue,
    ],
  );

  // popup 设置
  const popupProps = useMemo(
    () => ({
      ...popupPropsFromProps,
      expandAnimation: true,
      overlayClassName: `${name}__panel-container`,
      onVisibleChange: (visible: boolean, context) => {
        // 输入框点击不关闭面板
        if (context.trigger === 'trigger-element-click') {
          return setPopupVisible(true);
        }
        if (visible) {
          // 展开后重置点击次数
          setIsFirstClick(false);
        } else {
          setIsHoverCell(false);
        }

        setPopupVisible(visible);
      },
    }),
    [name, popupPropsFromProps, setPopupVisible],
  );

  // 输入框响应 value 变化
  useEffect(() => {
    if (!value) return setInputValue([]);
    if (!isValidDate(value, format, true)) return;

    setInputValue(formatDate(value));
  }, [value, format, formatDate, setInputValue]);

  useEffect(() => {
    if (!inputRef.current) return;
    const indexMap = { 0: 'first', 1: 'second' };
    inputRef.current.focus({ position: indexMap[activeIndex] });
  }, [activeIndex])

  return {
    year,
    month,
    value,
    timeValue,
    inputValue,
    popupVisible,
    rangeInputProps,
    popupProps,
    inputRef,
    onChange,
    setYear,
    setMonth,
    setTimeValue,
    setIsHoverCell,
    setInputValue,
    setPopupVisible,
    formatDate,
    activeIndex,
    setActiveIndex,
    isValidDate,
    isFirstClick,
    setIsFirstClick,
  };
}
