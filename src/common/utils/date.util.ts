/**
 * Utilitaires pour la gestion des dates
 *
 * Ces fonctions garantissent une gestion cohérente des dates
 * en tenant compte du fuseau horaire du serveur
 */

/**
 * Retourne la date de début du jour actuel (00:00:00.000)
 *
 * @returns Date représentant le début du jour (minuit)
 * @example
 * // Si aujourd'hui est le 14/11/2025
 * getTodayStart() // → 2025-11-14T00:00:00.000
 */
export function getTodayStart(): Date {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, // hours
    0, // minutes
    0, // seconds
    0  // milliseconds
  );
  return startOfDay;
}

/**
 * Retourne la date de fin du jour actuel (23:59:59.999)
 *
 * @returns Date représentant la fin du jour (avant minuit)
 * @example
 * // Si aujourd'hui est le 14/11/2025
 * getTodayEnd() // → 2025-11-14T23:59:59.999
 */
export function getTodayEnd(): Date {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, // hours
    59, // minutes
    59, // seconds
    999 // milliseconds
  );
  return endOfDay;
}

/**
 * Retourne un objet contenant le début et la fin du jour actuel
 *
 * @returns Objet avec startOfDay et endOfDay
 * @example
 * const { startOfDay, endOfDay } = getTodayRange();
 * // startOfDay: 2025-11-14T00:00:00.000
 * // endOfDay: 2025-11-14T23:59:59.999
 */
export function getTodayRange(): { startOfDay: Date; endOfDay: Date } {
  return {
    startOfDay: getTodayStart(),
    endOfDay: getTodayEnd()
  };
}

/**
 * Vérifie si une date donnée correspond à aujourd'hui
 *
 * @param date - Date à vérifier
 * @returns true si la date est aujourd'hui, false sinon
 * @example
 * isToday(new Date('2025-11-14T15:30:00')) // → true si aujourd'hui est le 14/11/2025
 * isToday(new Date('2025-11-13T15:30:00')) // → false
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Retourne le début d'une date spécifique (00:00:00.000)
 *
 * @param date - Date de référence
 * @returns Date représentant le début du jour
 */
export function getStartOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  );
}

/**
 * Retourne la fin d'une date spécifique (23:59:59.999)
 *
 * @param date - Date de référence
 * @returns Date représentant la fin du jour
 */
export function getEndOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23, 59, 59, 999
  );
}
