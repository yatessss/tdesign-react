import React from 'react';
import { DateRangePicker } from 'tdesign-react';

export default function YearDatePicker() {
  // 选中日期时的事件
  function onPick(value, context) {
    console.log('onPick:', value, context);
  }
  return (
    <div className="tdesign-demo-item--datepicker tdesign-demo-block-column">
      <DateRangePicker mode="date" onPick={onPick} />
      <DateRangePicker mode="date" format="YYYY-MM-DD HH:mm:ss" enableTimePicker />
    </div>
  );
}
