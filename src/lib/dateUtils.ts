/**
 * Utilitários para trabalhar com datas sem problemas de timezone
 */

/**
 * Converte uma data para string no formato yyyy-MM-dd sem conversão de timezone
 * @param date Data a ser convertida
 * @returns String no formato yyyy-MM-dd
 */
export function formatDateLocal(date: Date): string {
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, "0");
     const day = String(date.getDate()).padStart(2, "0");
     return `${year}-${month}-${day}`;
}

/**
 * Converte uma string yyyy-MM-dd para Date sem conversão de timezone
 * @param dateStr String no formato yyyy-MM-dd
 * @returns Date object
 */
export function parseDateLocal(dateStr: string): Date {
     const [year, month, day] = dateStr.split("-").map(Number);
     return new Date(year, month - 1, day);
}

/**
 * Normaliza uma data para meia-noite local (00:00:00)
 * Útil para comparações e para evitar problemas de timezone
 * @param date Data a ser normalizada
 * @returns Nova data às 00:00:00 local
 */
export function normalizeToLocalDate(date: Date): Date {
     return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Obtém a data atual no formato yyyy-MM-dd sem conversão de timezone
 * @returns String no formato yyyy-MM-dd
 */
export function getTodayLocal(): string {
     return formatDateLocal(new Date());
}

/**
 * Adiciona dias a uma data sem conversão de timezone
 * @param date Data base
 * @param days Número de dias a adicionar (pode ser negativo)
 * @returns Nova data
 */
export function addDaysLocal(date: Date, days: number): Date {
     const result = new Date(date);
     result.setDate(result.getDate() + days);
     return result;
}

/**
 * Formata uma data para exibição (dd/MM/yyyy)
 * @param dateStr String no formato yyyy-MM-dd
 * @returns String no formato dd/MM/yyyy
 */
export function formatDateDisplay(dateStr: string): string {
     const date = parseDateLocal(dateStr);
     const day = String(date.getDate()).padStart(2, "0");
     const month = String(date.getMonth() + 1).padStart(2, "0");
     const year = date.getFullYear();
     return `${day}/${month}/${year}`;
}
