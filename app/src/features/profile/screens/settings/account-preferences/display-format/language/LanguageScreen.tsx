import React from "react";
import { useSettings } from "@shared/context/SettingsContext";
import OptionPickerScreen from "../components/OptionPickerScreen";

const options = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "ru", label: "Русский" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

function mapLanguageToCode(lang: string): string {
  const match = options.find((o) => o.label === lang);
  return match ? match.value : "en";
}
function mapCodeToLanguage(code: string): string {
  const match = options.find((o) => o.value === code);
  return match ? match.label : "English";
}

const LanguageScreen: React.FC = () => {
  const { settings, updateGeneralSettings } = useSettings();
  const selected = mapLanguageToCode(settings.general.language);
  const currentLabel =
    options.find((o) => o.value === selected)?.label ?? "English";

  return (
    <OptionPickerScreen
      headerTitle="Language"
      cardHeader="APP LANGUAGE"
      sheetTitle="Language"
      icon="language-outline"
      iconColor="#4CD964"
      cardLabel="Language"
      options={options}
      selected={selected}
      displayValue={currentLabel}
      onSelect={(value) =>
        updateGeneralSettings({ language: mapCodeToLanguage(value) })
      }
    />
  );
};

export default LanguageScreen;
