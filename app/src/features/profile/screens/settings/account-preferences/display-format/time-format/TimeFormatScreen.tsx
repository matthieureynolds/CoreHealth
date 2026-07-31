import React from "react";
import { useSettings } from "@shared/context/SettingsContext";
import OptionPickerScreen from "../components/OptionPickerScreen";

const options = [
  { value: "12h", label: "12-Hour", description: "1:30 PM" },
  { value: "24h", label: "24-Hour", description: "13:30" },
];

const TimeFormatScreen: React.FC = () => {
  const { settings, updateGeneralSettings } = useSettings();
  const selected = settings.general.timeFormat;
  const currentOption = options.find((o) => o.value === selected);

  return (
    <OptionPickerScreen
      headerTitle="Time Format"
      cardHeader="TIME FORMAT"
      sheetTitle="Time Format"
      icon="time-outline"
      iconColor="#5856D6"
      cardLabel="Time Format"
      options={options}
      selected={selected}
      displayValue={currentOption?.description ?? selected}
      onSelect={(value) => updateGeneralSettings({ timeFormat: value as any })}
    />
  );
};

export default TimeFormatScreen;
