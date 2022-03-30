import React, { useState, useRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import { CloseCircleFilledIcon } from 'tdesign-icons-react';
import Input from '../input';
import useConfig from '../_util/useConfig';
import useDefault from '../_util/useDefault';
import type { StyledProps, TNode } from '../common';
import type { TdRangeInputProps, RangeInputValue, RangeInputInstanceFunctions } from './type';

export interface RangeInputProps extends TdRangeInputProps, StyledProps {}

export interface RangeInputRefInterface extends React.RefObject<unknown>, RangeInputInstanceFunctions {
  currentElement: HTMLFormElement;
}

function calcArrayValue(value: unknown | Array<unknown>) {
  if (Array.isArray(value)) {
    return value;
  }
  return [value, value];
}

const renderIcon = (classPrefix: string, type: 'prefix' | 'suffix', icon: TNode) => {
  let result: React.ReactNode = null;

  if (icon) result = icon;

  if (typeof icon === 'function') result = icon();

  const iconClassName = icon ? `${classPrefix}-range-input__${type}-icon` : '';

  if (result) {
    result = <span className={`${classPrefix}-range-input__${type} ${iconClassName}`}>{result}</span>;
  }

  return result;
};

const RangeInput = React.forwardRef((props: RangeInputProps, ref: React.RefObject<HTMLDivElement>) => {
  const { classPrefix } = useConfig();

  const {
    value: valueFromProps,
    defaultValue,
    className,
    style,
    disabled,
    format,
    inputProps,
    label,
    placeholder,
    readonly,
    separator = '-',
    status,
    size,
    tips,
    suffix,
    prefixIcon,
    suffixIcon,
    clearable,
    showClearIconOnEmpty,
    onEnter,
    onClear,
    onFocus,
    onBlur,
    onMouseenter,
    onMouseleave,
    onChange: onChangeFromProps,
    ...restProps
  } = props;

  const name = `${classPrefix}-range-input`;

  const wrapperRef = useRef();
  const inputRefs = {
    firstInputRef: useRef(),
    secondInputRef: useRef(),
  };

  const [isFocused, toggleIsFocused] = useState(false);
  const [isHover, toggleIsHover] = useState(false);
  const [firstFormat, secondFormat] = calcArrayValue(format);
  const [firstPlaceholder = '请输入内容', secondPlaceholder = '请输入内容'] = calcArrayValue(placeholder);
  const [firstInputProps, secondInputProps] = calcArrayValue(inputProps);

  const [value, onChange] = useDefault(valueFromProps, defaultValue, onChangeFromProps);
  const [firstValue, secondValue] = value || [];

  const isShowClearIcon = ((clearable && value && !disabled) || showClearIconOnEmpty) && isHover;
  let suffixIconNew = suffixIcon;

  if (isShowClearIcon) {
    suffixIconNew = <CloseCircleFilledIcon className={`${name}__suffix-clear`} onClick={handleClear} />;
  }

  const labelContent = isFunction(label) ? label() : label;
  const prefixIconContent = renderIcon(classPrefix, 'prefix', prefixIcon);
  const suffixContent = isFunction(suffix) ? suffix() : suffix;
  const suffixIconContent = renderIcon(classPrefix, 'suffix', suffixIconNew);

  function handleClear(e: React.MouseEvent<SVGSVGElement>) {
    onClear?.({ e });
    onChange?.(['', ''], { e, trigger: 'clear', position: 'all' });
  }

  function handleEnter(rangeValue: RangeInputValue, context) {
    onEnter?.(rangeValue, context);
  }

  function handleFocus(rangeValue: RangeInputValue, context) {
    onFocus?.(rangeValue, context);
    toggleIsFocused(true);
  }

  function handleBlur(rangeValue: RangeInputValue, context) {
    onBlur?.(rangeValue, context);
    toggleIsFocused(false);
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    toggleIsHover(true);
    onMouseenter?.({ e });
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    toggleIsHover(false);
    onMouseleave?.({ e });
  }

  useImperativeHandle(ref as RangeInputRefInterface, () => ({
    currentElement: wrapperRef.current,
    firstInputElement: inputRefs.firstInputRef.current,
    secondInputElement: inputRefs.secondInputRef.current,
    focus: (options) => {
      const { position = 'first' } = options || {};
      inputRefs[`${position}InputRef`].current?.focus();
    },
    blur: (options) => {
      const { position = 'first' } = options || {};
      inputRefs[`${position}InputRef`].current?.blur();
    },
    select: (options) => {
      const { position = 'first' } = options || {};
      inputRefs[`${position}InputRef`].current?.select();
    },
  }));

  return (
    <div
      ref={wrapperRef}
      style={style}
      className={classNames(name, className, {
        [`${classPrefix}-is-focused`]: isFocused,
        [`${classPrefix}-is-${status}`]: status,
        [`${classPrefix}-size-l`]: size === 'large',
        [`${classPrefix}-size-s`]: size === 'small',
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...restProps}
    >
      <div className={`${name}__inner`}>
        {prefixIconContent}
        {labelContent ? <div className={`${classPrefix}-input__prefix`}>{labelContent}</div> : null}
        <Input
          ref={inputRefs.firstInputRef}
          className={`${name}__inner-left`}
          placeholder={firstPlaceholder}
          disabled={disabled}
          readonly={readonly}
          format={firstFormat}
          value={firstValue}
          onClear={() => onChange?.([], { position: 'second', trigger: 'input' })}
          onEnter={(val, { e }) => handleEnter([val, secondValue], { e, position: 'first' })}
          onFocus={(val, { e }) => handleFocus([val, secondValue], { e, position: 'first' })}
          onBlur={(val, { e }) => handleBlur([val, secondValue], { e, position: 'first' })}
          onChange={(val, { e }) => onChange?.([val, secondValue], { e, position: 'first', trigger: 'input' })}
          {...firstInputProps}
        />

        <div className={`${name}__inner-separator`}>{separator}</div>

        <Input
          ref={inputRefs.secondInputRef}
          className={`${name}__inner-right`}
          placeholder={secondPlaceholder}
          disabled={disabled}
          readonly={readonly}
          format={secondFormat}
          value={secondValue}
          onClear={() => onChange?.([], { position: 'second', trigger: 'input' })}
          onEnter={(val, { e }) => handleEnter([firstValue, val], { e, position: 'second' })}
          onFocus={(val, { e }) => handleFocus([firstValue, val], { e, position: 'second' })}
          onBlur={(val, { e }) => handleBlur([firstValue, val], { e, position: 'second' })}
          onChange={(val, { e }) => onChange?.([firstValue, val], { e, position: 'second', trigger: 'input' })}
          {...secondInputProps}
        />
        {suffixContent ? <div className={`${name}__suffix`}>{suffixContent}</div> : null}
        {suffixIconContent}
      </div>
      {tips && <div className={`${name}__tips`}>{tips}</div>}
    </div>
  );
});

RangeInput.displayName = 'RangeInput';

export default RangeInput;