import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { formModalStyles as s } from "./formModalStyles";

interface ChipSelectorProps<T extends string> {
  label?: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  labelMap?: Record<string, string>;
}

function ChipSelector<T extends string>({
  label,
  options,
  selected,
  onSelect,
  labelMap,
}: ChipSelectorProps<T>) {
  const optLabel = (opt: T) =>
    labelMap?.[opt] ?? opt.charAt(0).toUpperCase() + opt.slice(1);
  return (
    <>
      {label && <Text style={s.sectionLabel}>{label}</Text>}
      <View style={s.chipRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt || "empty"}
            style={[s.chip, selected === opt && s.chipActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[s.chipText, selected === opt && s.chipTextActive]}>
              {optLabel(opt)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

export default ChipSelector;
