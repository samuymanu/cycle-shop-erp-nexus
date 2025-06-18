
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
  onPrintLastReceipt?: () => void;
  onToggleFilters?: () => void;
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
  onPrintLastReceipt,
  onToggleFilters,
}: POSShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesar si no estamos en un input/textarea/select
      const isInputElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement)?.tagName
      );

      // Atajos que funcionan incluso en inputs
      if (e.key === 'F2') {
        e.preventDefault();
        onSearchFocus?.();
        return;
      }

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
          case 'r':
            e.preventDefault();
            onPrintLastReceipt?.();
            break;
          case 'h':
            e.preventDefault();
            onToggleFilters?.();
            break;
        }
        return;
      }

      // Atajos con Alt para navegación rápida
      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            onCategoryAll?.();
            break;
          case '2':
            e.preventDefault();
            onCategoryBikes?.();
            break;
          case '3':
            e.preventDefault();
            onCategoryMotos?.();
            break;
          case '4':
            e.preventDefault();
            onCategoryAccessories?.();
            break;
          case '5':
            e.preventDefault();
            onCategoryParts?.();
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
        case 'F9':
          e.preventDefault();
          onPrintLastReceipt?.();
          break;
        case 'Escape':
          // Cerrar modales o limpiar búsqueda
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.tagName === 'INPUT') {
            (activeElement as HTMLInputElement).value = '';
            activeElement.blur();
          }
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
    onPrintLastReceipt,
    onToggleFilters,
  ]);
};
