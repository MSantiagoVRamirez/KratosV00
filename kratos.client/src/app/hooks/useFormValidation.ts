import { useMemo } from 'react';

interface FormField {
  value: any;
  required: boolean;
  type?: 'string' | 'number' | 'email' | 'select' | 'date' | 'boolean';
}

interface FormFields {
  [key: string]: FormField;
}

export function useFormValidation(fields: FormFields): boolean {
  const isValid = useMemo(() => {
    return Object.values(fields).every(field => {
      if (!field.required) return true;
      
      // Validar según el tipo de campo
      switch (field.type) {
        case 'string':
        case 'email':
          return typeof field.value === 'string' && field.value.trim().length > 0;
        
        case 'number':
          return typeof field.value === 'number' && !isNaN(field.value);
        
        case 'select':
          return field.value !== null && field.value !== undefined && 
                 field.value !== '' && field.value !== 0;
        
        case 'date':
          return field.value && field.value.toString().trim().length > 0;
        
        default:
          // Validación genérica: no debe ser null, undefined, o string vacío
          if (field.value === null || field.value === undefined) return false;
          if (typeof field.value === 'string') return field.value.trim().length > 0;
          if (typeof field.value === 'number') return !isNaN(field.value);
          return true;
      }
    });
  }, [fields]);

  return isValid;
} 