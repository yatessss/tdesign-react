import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalendarIcon } from 'tdesign-icons-react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import useConfig from '../../_util/useConfig';
import useDefault from '../../_util/useDefault';
import { RangeInputRefInterface } from '../../range-input';
import { TdDateRangePickerProps, DateValue } from '../type';
import useFormat from './useFormat';

const TIME_FORMAT = 'HH:mm:ss';

export const PARTIAL_MAP = { first: 'start', second: 'end' };

export default function useSingle(props: TdDateRangePickerProps) {
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
  const { isValidDate, timeFormat, formatDate, getFinalFormat } = useFormat({ ...props, value });

  // warning invalid value
  if (!Array.isArray(value)) {
    console.error(`typeof value: ${value} must be Array!`);
  } else if (!isValidDate(value)) {
    console.error(`value: ${value} is invalid datetime!`);
  }

  const [popupVisible, setPopupVisible] = useState(false);
  const [isHoverCell, setIsHoverCell] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // 确定当前选中的输入框序号
  const [timeValue, setTimeValue] = useState(value.map((v) => dayjs(v).format(timeFormat || TIME_FORMAT)));
  const [month, setMonth] = useState(value.map((v) => dayjs(v).month() || new Date().getMonth()));
  const [year, setYear] = useState(value.map((v) => dayjs(v).year() || new Date().getFullYear()));

  // 未真正选中前可能不断变更输入框的内容
  const [inputValue, setInputValue] = useState(formatDate(value));

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

        const finalFormat = getFinalFormat(format);
        // 跳过不符合格式化的输入框内容
        if (!isValidDate(newVal, finalFormat, true)) return;
        const newYear = [];
        const newMonth = [];
        const newTime = [];
        newVal.forEach((v, i) => {
          newYear.push(dayjs(v).year() || year[i]);
          newMonth.push(dayjs(v).month() || month[i]);
          newTime.push(dayjs(v).format(timeFormat || TIME_FORMAT) || timeValue[i]);
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
      getFinalFormat,
      isValidDate,
    ],
  );

  // popup 设置
  const popupProps = useMemo(
    () => ({
      ...popupPropsFromProps,
      expandAnimation: true,
      overlayClassName: `${name}__panel-container`,
      onVisibleChange: (visible: boolean) => {
        setPopupVisible(visible);
        if (!visible) {
          setIsHoverCell(false);
        }
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
  };
}
