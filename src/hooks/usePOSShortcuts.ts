
import { useEffect } from 'react';

interface POSShortcutsProps {
  onProcessSale?: () => void;
  onClearCart?: () => void;
  onSearchFocus?: () => void;
  onPaymentFocus?: () => void;
  onCategoryAll?: () => void;
  onCategoryBikes?: () => void;
  onCategoryMotos?: () => void;
  onCategoryAccessories?: () => void;
  onCategoryParts?: () => void;
}

export const usePOSShortcuts = ({
  onProcessSale,
  onClearCart,
  onSearchFocus,
  onPaymentFocus,
  onCategoryAll,
  onCategoryBikes,
  onCategoryMotos,
  onCategoryAccessories,
  onCategoryParts,
}: POSShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesar si no estamos en un input/textarea/select
      const isInputElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement)?.tagName
      );

      if (isInputElement) return;

      // Atajos con Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'enter':
            e.preventDefault();
            onProcessSale?.();
            break;
          case 'delete':
          case 'backspace':
            e.preventDefault();
            onClearCart?.();
            break;
          case 'f':
            e.preventDefault();
            onSearchFocus?.();
            break;
          case 'p':
            e.preventDefault();
            onPaymentFocus?.();
            break;
        }
        return;
      }

      // Atajos directos (sin modificadores)
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          onCategoryAll?.();
          break;
        case 'F2':
          e.preventDefault();
          onCategoryBikes?.();
          break;
        case 'F3':
          e.preventDefault();
          onCategoryMotos?.();
          break;
        case 'F4':
          e.preventDefault();
          onCategoryAccessories?.();
          break;
        case 'F5':
          e.preventDefault();
          onCategoryParts?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onProcessSale,
    onClearCart,
    onSearchFocus,
    onPaymentFocus,
    onCategoryAll,
    onCategoryBikes,
    onCategoryMotos,
    onCategoryAccessories,
    onCategoryParts,
  ]);
};
