import { useCallback } from 'react';
import dayjs from 'dayjs';
import type { DateValue } from '../type';
import { extractTimeFormat, extractTimeObj } from '../../_common/js/date-picker/utils-new';

const TIME_FORMAT = 'HH:mm:ss';

export default function useFormat(props) {
  const { enableTimePicker, format = 'YYYY-MM-DD', valueType = 'YYYY-MM-DD', value } = props;

  // 提取时间格式化
  const timeFormat = extractTimeFormat(format) || TIME_FORMAT;
  // 兼容未传入正确 format 场景
  const getFullFormat = useCallback(
    () => {
      let fullFormat = format;
      const timeFormat = extractTimeFormat(fullFormat);
      if (enableTimePicker && !timeFormat) {
        fullFormat = [fullFormat, TIME_FORMAT].join(' ');
      }
      return fullFormat;
    },
    [format, enableTimePicker],
  );

  // 日期格式化
  const formatDate = useCallback(
    (newDate: DateValue | DateValue[], type = 'format') => {
      const formatMap = { format, valueType };
      const fullFormat = getFullFormat();
      const targetFormat = formatMap[type];

      let result;

      if (Array.isArray(newDate)) {
        result = formatRange({ newDate, fullFormat, targetFormat, enableTimePicker });
        // 格式化失败提示
        if (result.some((r) => r === 'Invalid Date')) {
          console.error(
            `请检查 format、valueType、value 格式是否有效.\nformat: '${format}' valueType: '${valueType}' value: '${value}'`,
          );
          return [];
        }
      } else {
        result = formatSingle({ newDate, fullFormat, targetFormat, enableTimePicker });
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
    [value, enableTimePicker, format, valueType, getFullFormat],
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
    getFullFormat,
  };
}

function formatRange({ newDate, fullFormat, targetFormat, enableTimePicker }) {
  if (!newDate || !Array.isArray(newDate)) return [];

  const dayjsDateList = newDate.map((d) => dayjs(d).isValid() ? dayjs(d) : dayjs(d, fullFormat));
  const timeFormat = extractTimeFormat(targetFormat) || TIME_FORMAT;
  const formatedTimeList = dayjsDateList.map((da) => da.format(timeFormat));
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
  if (targetFormat === 'time-stamp') {
    return dayjsDateList.map((da) => da.toDate().getTime());
  }

  return dayjsDateList.map((da) => da.format(targetFormat));
}

function formatSingle({ newDate, fullFormat, targetFormat, enableTimePicker }) {
  if (!newDate) return '';

  let dayJsDate = dayjs(newDate).isValid() ? dayjs(newDate) : dayjs(newDate, fullFormat);
  const timeFormat = extractTimeFormat(targetFormat) || TIME_FORMAT;
  const formatedTime = dayJsDate.format(timeFormat);
  if (enableTimePicker) {
    const { hours, minutes, seconds, milliseconds, meridiem } = extractTimeObj(formatedTime);
    dayJsDate = dayJsDate
      .hour(hours + (/pm/i.test(meridiem) ? 12 : 0))
      .minute(minutes)
      .second(seconds)
      .millisecond(milliseconds);
  }

  // valueType = 'time-stamp' 返回时间戳
  if (targetFormat === 'time-stamp') return dayJsDate.toDate().getTime();

  return dayJsDate.format(targetFormat);
}
