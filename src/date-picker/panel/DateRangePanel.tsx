import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import useConfig from '../../_util/useConfig';
import { StyledProps } from '../../common';
import PanelContent from './PanelContent';
import ExtraContent from './ExtraContent';
import { TdDateRangePickerProps, DateValue } from '../type';
import type { TdTimePickerProps } from '../../time-picker';
import useTableData from './useTableData';
import useDisableDate from '../hooks/useDisableDate';

export interface DateRangePanelProps extends TdDateRangePickerProps, StyledProps {
  year?: number[];
  month?: number[];
  timeValue?: string[];
  onClick?: (context: { e: React.MouseEvent<HTMLDivElement> }) => void;
  onCellClick?: (date: Date, context: { partial: 'start' | 'end' }) => void;
  onCellMouseEnter?: (date: Date, context: { partial: 'start' | 'end' }) => void;
  onCellMouseLeave?: (context: { e: React.MouseEvent<HTMLDivElement> }) => void;
  onJumperClick?: (flag: number, context: { partial: 'start' | 'end' }) => void;
  onConfirmClick?: (context: { e: React.MouseEvent<HTMLButtonElement> }) => void;
  onPresetClick?: (
    preset: DateValue | (() => DateValue),
    context: { e: React.MouseEventHandler<HTMLButtonElement> },
  ) => void;
  onYearChange?: (year: number, context: { partial: 'start' | 'end' }) => void;
  onMonthChange?: (month: number, context: { partial: 'start' | 'end' }) => void;
  onTimePickerChange?: TdTimePickerProps['onChange'];
}

const DateRangePanel = (props: DateRangePanelProps) => {
  const { classPrefix, datePicker: globalDatePickerConfig } = useConfig();
  const panelName = `${classPrefix}-date-range-picker__panel`;
  const {
    value,
    mode = 'month',
    format,
    presets,
    enableTimePicker,
    presetsPlacement = 'bottom',
    disableDate: disableDateFromProps,
    firstDayOfWeek = globalDatePickerConfig.firstDayOfWeek,

    style,
    className,
    year,
    month,
    timeValue,
    onClick,
    onConfirmClick,
    onPresetClick,
  } = props;

  const disableDateOptions = useDisableDate({ disableDate: disableDateFromProps, mode, format });

  const [startYear = dayjs().year(), endYear = dayjs().year()] = year;
  const [startMonth = dayjs().month(), endMonth = dayjs().month() + 1] = month;

  const startTableData = useTableData({
    start: dayjs(value[0] || new Date()).toDate(),
    end: dayjs(value[1] || new Date()).toDate(),
    year: startYear,
    month: startMonth,
    mode,
    firstDayOfWeek,
    ...disableDateOptions,
  });
  const endTableData = useTableData({
    start: dayjs(value[0] || new Date()).toDate(),
    end: dayjs(value[1] || new Date()).toDate(),
    year: endYear,
    month: endMonth,
    mode,
    firstDayOfWeek,
    ...disableDateOptions,
  });

  const panelContentProps = {
    mode,
    format,
    firstDayOfWeek,

    enableTimePicker: props.enableTimePicker,
    timePickerProps: props.timePickerProps,
    onMonthChange: props.onMonthChange,
    onYearChange: props.onYearChange,
    onJumperClick: props.onJumperClick,
    onCellClick: props.onCellClick,
    onCellMouseEnter: props.onCellMouseEnter,
    onCellMouseLeave: props.onCellMouseLeave,
    onTimePickerChange: props.onTimePickerChange,
  };

  return (
    <div
      style={style}
      className={classNames(panelName, className, {
        [`${panelName}--direction-row`]: ['left', 'right'].includes(presetsPlacement),
      })}
      onClick={(e) => onClick?.({ e })}
    >
      {['top', 'left'].includes(presetsPlacement) ? (
        <ExtraContent
          presets={presets}
          enableTimePicker={enableTimePicker}
          onPresetClick={onPresetClick}
          onConfirmClick={onConfirmClick}
          presetsPlacement={presetsPlacement}
        />
      ) : null}
      <div className={`${panelName}--content-wrapper`}>
        <PanelContent
          partial='start'
          year={startYear}
          month={startMonth}
          timeValue={timeValue[0]}
          tableData={startTableData}
          {...panelContentProps}
        />
        {!enableTimePicker ? (
          <PanelContent
            partial='end'
            year={endYear}
            month={endMonth}
            timeValue={timeValue[1]}
            tableData={endTableData}
            {...panelContentProps}
          />
        ) : null}
      </div>
      {['bottom', 'right'].includes(presetsPlacement) ? (
        <ExtraContent
          presets={presets}
          enableTimePicker={enableTimePicker}
          onPresetClick={onPresetClick}
          onConfirmClick={onConfirmClick}
          presetsPlacement={presetsPlacement}
        />
      ) : null}
    </div>
  );
};

DateRangePanel.displayName = 'DateRangePanel';

export default DateRangePanel;
