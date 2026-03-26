import React from 'react';
import { useSettings } from '../../../../../../../shared/context/SettingsContext';
import OptionPickerScreen from '../components/OptionPickerScreen';

const options = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', description: '31/12/2024' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', description: '12/31/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', description: '2024-12-31' },
];

const DateFormatScreen: React.FC = () => {
  const { settings, updateGeneralSettings } = useSettings();
  const selected = settings.general.dateFormat;
  const currentOption = options.find(o => o.value === selected);

  return (
    <OptionPickerScreen
      headerTitle="Date Format"
      cardHeader="DATE FORMAT"
      sheetTitle="Date Format"
      icon="calendar-outline"
      iconColor="#34C759"
      cardLabel="Date Format"
      options={options}
      selected={selected}
      displayValue={currentOption?.description ?? selected}
      onSelect={(value) => updateGeneralSettings({ dateFormat: value as any })}
    />
  );
};

export default DateFormatScreen;
