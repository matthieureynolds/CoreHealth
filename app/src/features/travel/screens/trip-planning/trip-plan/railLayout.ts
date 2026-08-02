import { Dimensions } from "react-native";
import { COL_KEYS } from "./tripRail";

/**
 * Pixel geometry for the day rail.
 *
 * Separate from tripRail because `Dimensions.get` runs at import time, which
 * makes the module unloadable in the node test environment. The rail *logic*
 * has to stay testable; only the widths need a device.
 */
const SCREEN_W = Dimensions.get("window").width;
export const CAP_W = 34;
export const MARK = 30; // icon chip diameter
const RAIL_INSET = 34; // matches the vertical frame rails
const COL_W = (SCREEN_W - RAIL_INSET * 2) / COL_KEYS.length;
export const colCenterX = (col: number) => RAIL_INSET + (col + 0.5) * COL_W;
