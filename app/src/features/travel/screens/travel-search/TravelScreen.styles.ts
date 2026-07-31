/**
 * Travel search UI styles — split into focused slices for maintainability.
 * Public API unchanged: `import { styles } from './TravelScreen.styles'`.
 */
import { travelShellStyles } from "./styles/travelScreen.shell.styles";
import { travelModalsAndFormsStyles } from "./styles/travelScreen.modalsAndForms.styles";
import { travelHealthTripsAndSheetsStyles } from "./styles/travelScreen.healthTripsAndSheets.styles";

export const styles = {
  ...travelShellStyles,
  ...travelModalsAndFormsStyles,
  ...travelHealthTripsAndSheetsStyles,
};
