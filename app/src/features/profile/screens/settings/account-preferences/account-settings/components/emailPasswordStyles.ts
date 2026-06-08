import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 0,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  currentValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  editButton: {
    padding: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  divider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 16,
  },
  editForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
  },
  firstFieldLabel: {
    marginTop: 0,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 0,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2C2C2E',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 4,
  },
  buttonRow: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  updateButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.4,
  },
  updateButtonText: {
    color: '#3AABF0',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default styles;
