import { useState, useEffect, useRef } from "react";

interface Seed {
  newTripDepartureDate?: Date;
  newTripReturnDate?: Date;
  newTripDepartureTime?: Date;
  newTripReturnTime?: Date;
  editTripDepartureDate: Date;
  editTripReturnDate?: Date;
}

/**
 * The add- and edit-trip date/time pickers.
 *
 * Takes the current field values as a seed rather than owning them: the init
 * effects read them once on open, and depending on them would reset the picker
 * mid-scroll every time the user moved it.
 */
export function useDatePickers(seed: Seed) {
  const [showDatePicker, setShowDatePicker] = useState<
    "departure" | "return" | "departureTime" | "returnTime" | null
  >(null);
  const [tempDatePickerValue, setTempDatePickerValue] = useState<
    Date | undefined
  >(undefined);
  const [showEditDatePicker, setShowEditDatePicker] = useState<
    "departure" | "return" | null
  >(null);
  const [tempEditDatePickerValue, setTempEditDatePickerValue] = useState<
    Date | undefined
  >(undefined);
  const pendingDateRef = useRef<Date | undefined>(undefined);
  const datePickerInitializedRef = useRef(false);
  const editDatePickerInitializedRef = useRef(false);

  // Date/time picker init (add trip)
  useEffect(() => {
    if (showDatePicker) {
      if (!datePickerInitializedRef.current) {
        let d: Date;
        if (showDatePicker === "departure") {
          d = seed.newTripDepartureDate
            ? new Date(seed.newTripDepartureDate)
            : new Date();
        } else if (showDatePicker === "return") {
          d = new Date(seed.newTripReturnDate || new Date());
        } else if (showDatePicker === "departureTime") {
          d = seed.newTripDepartureTime
            ? new Date(seed.newTripDepartureTime)
            : new Date();
        } else {
          d = seed.newTripReturnTime
            ? new Date(seed.newTripReturnTime)
            : new Date();
        }
        setTempDatePickerValue(d);
        pendingDateRef.current = d;
        datePickerInitializedRef.current = true;
      }
    } else {
      setTempDatePickerValue(undefined);
      datePickerInitializedRef.current = false;
    }
    // Deliberately keyed on open/close only. The dates are *read* to seed the
    // picker on open; depending on them would reset the picker mid-edit every
    // time the user moved it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDatePicker]);

  // Date picker init (edit trip)
  useEffect(() => {
    if (showEditDatePicker) {
      if (!editDatePickerInitializedRef.current) {
        if (showEditDatePicker === "departure")
          setTempEditDatePickerValue(new Date(seed.editTripDepartureDate));
        else
          setTempEditDatePickerValue(
            new Date(seed.editTripReturnDate || new Date()),
          );
        editDatePickerInitializedRef.current = true;
      }
    } else {
      setTempEditDatePickerValue(undefined);
      editDatePickerInitializedRef.current = false;
    }
    // Same as the add-trip picker above: seed on open, not on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditDatePicker]);

  return {
    showDatePicker,
    setShowDatePicker,
    tempDatePickerValue,
    setTempDatePickerValue,
    showEditDatePicker,
    setShowEditDatePicker,
    tempEditDatePickerValue,
    setTempEditDatePickerValue,
    pendingDateRef,
  };
}
