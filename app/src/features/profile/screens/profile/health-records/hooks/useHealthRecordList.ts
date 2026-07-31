import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@shared/context/AuthContext";
import { useFileViewer } from "./useFileViewer";

/**
 * Shared CRUD state management for health record list screens.
 *
 * Handles: loading items from DataService, add/edit/delete with optimistic
 * state updates, modal visibility, file viewer, and standard option alerts.
 *
 * Works for both DataService-backed screens (pass loadFn/saveFn/deleteFn)
 * and HealthDataContext-backed screens (pass items/onSave/onDelete directly).
 */

// ─── DataService-backed variant ──────────────────────────────────────────

interface DataServiceConfig<T extends { id: string }> {
  /** Fetch all items from the backend. Receives userId. */
  loadFn: (userId: string) => Promise<T[]>;
  /** Save (create or update) an item. Returns the saved item with server-assigned id. */
  saveFn: (userId: string, item: T, isEdit: boolean) => Promise<T>;
  /** Delete an item by id. */
  deleteFn: (userId: string, id: string) => Promise<void>;
  /** Human-readable record name for alerts, e.g. "Medication" */
  recordName: string;
  /** Returns the display name for an item (used in option alerts). */
  getItemName: (item: T) => string;
}

export function useHealthRecordList<T extends { id: string }>(
  config: DataServiceConfig<T>,
) {
  const { user } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const fileViewer = useFileViewer();

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const rows = await config.loadFn(user.id);
      setItems(rows);
    } catch (e) {
      console.error(`Failed to load ${config.recordName.toLowerCase()}s:`, e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, config]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleSave = useCallback(
    async (item: T) => {
      if (!user?.id) return;
      try {
        const isEdit = items.some((i) => i.id === item.id);
        const saved = await config.saveFn(user.id, item, isEdit);
        setItems((prev) =>
          isEdit
            ? prev.map((i) => (i.id === item.id ? saved : i))
            : [...prev, saved],
        );
      } catch (e) {
        Alert.alert(
          "Error",
          `Could not save ${config.recordName.toLowerCase()}.`,
        );
      }
      setShowModal(false);
      setEditingItem(null);
    },
    [user?.id, items, config],
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        `Delete ${config.recordName}`,
        `Are you sure you want to delete this ${config.recordName.toLowerCase()}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              if (!user?.id) return;
              try {
                await config.deleteFn(user.id, id);
                setItems((prev) => prev.filter((i) => i.id !== id));
              } catch (e) {
                Alert.alert(
                  "Error",
                  `Could not delete ${config.recordName.toLowerCase()}.`,
                );
              }
            },
          },
        ],
      );
    },
    [user?.id, config],
  );

  const openOptions = useCallback(
    (item: T) => {
      Alert.alert(config.getItemName(item), undefined, [
        {
          text: "Edit",
          onPress: () => {
            setEditingItem(item);
            setShowModal(true);
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(item.id),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [handleDelete, config],
  );

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
  }, []);

  return {
    items,
    loading,
    showModal,
    editingItem,
    handleSave,
    handleDelete,
    openOptions,
    openAddModal,
    closeModal,
    fileViewer,
    userId: user?.id,
  };
}

// ─── HealthDataContext-backed variant ─────────────────────────────────────

interface ContextConfig<T extends { id: string }> {
  /** Current items from profile context. */
  items: T[] | undefined;
  /** Persist updated items array. */
  updateItems: (items: T[]) => void;
  /** Human-readable record name for alerts, e.g. "Screening" */
  recordName: string;
  /** Returns the display name for an item. */
  getItemName: (item: T) => string;
}

export function useProfileRecordList<T extends { id: string }>(
  config: ContextConfig<T>,
) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const fileViewer = useFileViewer();

  const items = config.items ?? [];

  const handleSave = useCallback(
    (item: T) => {
      const existing = config.items ?? [];
      const isEdit = existing.some((i) => i.id === item.id);
      config.updateItems(
        isEdit
          ? existing.map((i) => (i.id === item.id ? item : i))
          : [...existing, item],
      );
      setShowModal(false);
      setEditingItem(null);
    },
    [config],
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        `Delete ${config.recordName}`,
        `Are you sure you want to delete this ${config.recordName.toLowerCase()}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () =>
              config.updateItems(
                (config.items ?? []).filter((i) => i.id !== id),
              ),
          },
        ],
      );
    },
    [config],
  );

  const openOptions = useCallback(
    (item: T) => {
      Alert.alert(config.getItemName(item), undefined, [
        {
          text: "Edit",
          onPress: () => {
            setEditingItem(item);
            setShowModal(true);
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(item.id),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [handleDelete, config],
  );

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
  }, []);

  return {
    items,
    loading: false as const,
    showModal,
    editingItem,
    handleSave,
    handleDelete,
    openOptions,
    openAddModal,
    closeModal,
    fileViewer,
  };
}
