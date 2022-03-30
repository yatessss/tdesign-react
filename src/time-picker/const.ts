import { useLocaleReceiver } from '../locale/LocalReceiver';

export const useTimePickerTextConfig = () => {
  const [local, t] = useLocaleReceiver('timePicker');
  return {
    nowtime: t(local.now),
    confirm: t(local.confirm),
    am: t(local.anteMeridiem),
    pm: t(local.postMeridiem),
    placeholder: t(local.placeholder),
  };
};