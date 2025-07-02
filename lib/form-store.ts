// lib/form-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FormStore<T extends Record<string, unknown>> = {
  formData: T;
  lastUpdated: number; // Timestamp when the form was last updated
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateFields: (fields: Partial<T>) => void;
  setFormData: (data: T) => void;
  resetForm: (initialData?: T) => void;
  checkAndResetIfExpired: (expiryHours?: number) => boolean; // Returns true if reset was performed
};

type FormStoreOptions<T> = {
  name: string;        // Unique store name for persistence
  initialData: T;      // Default form values
  persist?: boolean;   // Enable/disable persistence (default: true)
  expiryHours?: number; // Optional: Auto-reset after this many hours (default: no expiry)
};

export function createFormStore<T extends Record<string, unknown>>(
  options: FormStoreOptions<T>
) {
  return create<FormStore<T>>()(      
    options.persist !== false 
      ? persist(
          (set, get) => ({
            formData: options.initialData,
            lastUpdated: Date.now(),
            updateField: (field, value) => 
              set((state) => ({
                formData: { ...state.formData, [field]: value },
                lastUpdated: Date.now(),
              })),
            updateFields: (fields) =>
              set((state) => ({
                formData: { ...state.formData, ...fields },
                lastUpdated: Date.now(),
              })),
            setFormData: (data) => set({ 
              formData: data,
              lastUpdated: Date.now(),
            }),
            resetForm: (initialData) => 
              set({ 
                formData: initialData || options.initialData,
                lastUpdated: Date.now(),
              }),
            checkAndResetIfExpired: (expiryHours) => {
              const state = get();
              const configuredExpiry = expiryHours || options.expiryHours;
              
              // If no expiry is configured, don't reset
              if (!configuredExpiry) return false;
              
              const now = Date.now();
              const expiryTimeMs = configuredExpiry * 60 * 60 * 1000;
              const isExpired = now - state.lastUpdated > expiryTimeMs;
              
              if (isExpired) {
                set({ 
                  formData: options.initialData,
                  lastUpdated: now,
                });
                return true;
              }
              
              return false;
            },
          }),
          {
            name: options.name,
            partialize: (state) => ({ 
              formData: state.formData,
              lastUpdated: state.lastUpdated,
            }),
          }
        )
      : (set, get) => ({
          formData: options.initialData,
          lastUpdated: Date.now(),
          updateField: (field, value) => 
            set((state) => ({
              formData: { ...state.formData, [field]: value },
              lastUpdated: Date.now(),
            })),
          updateFields: (fields) =>
            set((state) => ({
              formData: { ...state.formData, ...fields },
              lastUpdated: Date.now(),
            })),
          setFormData: (data) => set({ 
            formData: data,
            lastUpdated: Date.now(),
          }),
          resetForm: (initialData) => 
            set({ 
              formData: initialData || options.initialData,
              lastUpdated: Date.now(),
            }),
          checkAndResetIfExpired: (expiryHours) => {
            const state = get();
            const configuredExpiry = expiryHours || options.expiryHours;
            
            // If no expiry is configured, don't reset
            if (!configuredExpiry) return false;
            
            const now = Date.now();
            const expiryTimeMs = configuredExpiry * 60 * 60 * 1000;
            const isExpired = now - state.lastUpdated > expiryTimeMs;
            
            if (isExpired) {
              set({ 
                formData: options.initialData,
                lastUpdated: now,
              });
              return true;
            }
            
            return false;
          },
        })
  );
}