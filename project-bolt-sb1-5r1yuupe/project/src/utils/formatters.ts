import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Format date string to readable format
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd MMMM yyyy', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Format datetime string to readable format
export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd MMMM yyyy HH:mm', { locale: fr });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
};