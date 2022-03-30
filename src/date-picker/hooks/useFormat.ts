import { useCallback } from 'react';
import dayjs from 'dayjs';
import type { DateValue } from '../type';
import { extractTimeFormat, extractTimeObj } from '../../_common/js/date-picker/utils-new';

const TIME_FORMAT = 'HH:mm:ss';

export default function useFormat(props) {
  const { enableTimePicker, format = 'YYYY-MM-DD', valueType = 'YYYY-MM-DD', value } = props;

  // 提取时间格式化
  const timeFormat = extractTimeFormat(format);
  // 兼容未传入正确 format 场景
  const getFinalFormat = useCallback(
    (format) => {
      let dateFormat = format;
      if (enableTimePicker && !timeFormat) {
        dateFormat = [dateFormat, TIME_FORMAT].join(' ');
      }
      return dateFormat;
    },
    [timeFormat, enableTimePicker],
  );

  // 日期格式化
  const formatDate = useCallback(
    (newDate: DateValue | DateValue[], type = 'format') => {
      const formatMap = { format, valueType };
      const dateFormat = getFinalFormat(formatMap[type]);

      let result;

      if (Array.isArray(newDate)) {
        result = formatRange({ newDate, dateFormat, enableTimePicker, timeFormat });
        // 格式化失败提示
        if (result.some((r) => r === 'Invalid Date')) {
          console.error(
            `请检查 format、valueType、value 格式是否有效.\nformat: '${format}' valueType: '${valueType}' value: '${value}'`,
          );
          return [];
        }
      } else {
        result = formatSingle({ newDate, dateFormat, enableTimePicker, timeFormat });
        // 格式化失败提示
        if (result === 'Invalid Date') {
          console.error(
            `请检查 format、valueType、value 格式是否有效.\nformat: '${format}' valueType: '${valueType}' value: '${value}'`,
          );
          return '';
        }
      }

      return result;
    },
    [value, timeFormat, enableTimePicker, format, valueType, getFinalFormat],
  );

  function isValidDate(value: DateValue | DateValue[], ...args: any) {
    if (Array.isArray(value)) {
      return value.every(v => dayjs(v, ...args).isValid())
    }
  
    return dayjs(value, ...args).isValid()
  }

  return {
    isValidDate,
    timeFormat,
    formatDate,
    getFinalFormat,
  };
}

function formatRange({ newDate, dateFormat, enableTimePicker, timeFormat }) {
  if (!newDate || !Array.isArray(newDate)) return [];

  const dayjsDateList = newDate.map((d) => dayjs(d));
  const formatedTimeList = dayjsDateList.map((da) => da.format(timeFormat || TIME_FORMAT));
  dayjsDateList.forEach((dayJsDate, index: number) => {
    if (!enableTimePicker) return;
    const { hours, minutes, seconds, milliseconds, meridiem } = extractTimeObj(formatedTimeList[index]);
    dayJsDate
      .hour(hours + (/pm/i.test(meridiem) ? 12 : 0))
      .minute(minutes)
      .second(seconds)
      .millisecond(milliseconds);
  });

  // valueType = 'time-stamp' 返回时间戳
  if (dateFormat === 'time-stamp') {
    return dayjsDateList.map((da) => da.toDate().getTime());
  }

  return dayjsDateList.map((da) => da.format(dateFormat));
}

function formatSingle({ newDate, dateFormat, enableTimePicker, timeFormat }) {
  if (!newDate) return '';

  let dayJsDate = dayjs(newDate);
  const formatedTime = dayJsDate.format(timeFormat || TIME_FORMAT);
  if (enableTimePicker) {
    const { hours, minutes, seconds, milliseconds, meridiem } = extractTimeObj(formatedTime);
    dayJsDate = dayJsDate
      .hour(hours + (/pm/i.test(meridiem) ? 12 : 0))
      .minute(minutes)
      .second(seconds)
      .millisecond(milliseconds);
  }

  // valueType = 'time-stamp' 返回时间戳
  if (dateFormat === 'time-stamp') return dayJsDate.toDate().getTime();

  return dayJsDate.format(dateFormat);
}
