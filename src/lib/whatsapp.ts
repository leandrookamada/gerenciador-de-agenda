/**
 * Utilitários para integração com WhatsApp
 */

/**
 * Formata número de telefone para o formato internacional do WhatsApp
 * Remove caracteres especiais e adiciona código do país se necessário
 */
export function formatPhoneForWhatsApp(phone: string): string {
     // Remove todos os caracteres não numéricos
     let cleaned = phone.replace(/\D/g, "");

     // Se começar com 0, remove
     if (cleaned.startsWith("0")) {
          cleaned = cleaned.substring(1);
     }

     // Se não tem código do país (55 para Brasil), adiciona
     if (!cleaned.startsWith("55") && cleaned.length <= 11) {
          cleaned = "55" + cleaned;
     }

     return cleaned;
}

/**
 * Gera link do WhatsApp com mensagem pré-formatada
 */
export function generateWhatsAppLink(phone: string, message: string): string {
     const formattedPhone = formatPhoneForWhatsApp(phone);
     const encodedMessage = encodeURIComponent(message);
     return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Mensagem de confirmação para o cliente após agendamento
 */
export function getClientConfirmationMessage(data: {
     patientName: string;
     serviceName: string;
     date: string;
     time: string;
     professionalName?: string;
}): string {
     return `Olá ${data.patientName}! ✅

Seu agendamento foi confirmado com sucesso!

📋 Serviço: ${data.serviceName}
📅 Data: ${data.date}
⏰ Horário: ${data.time}
${data.professionalName ? `👤 Profissional: ${data.professionalName}` : ""}

Qualquer dúvida, entre em contato conosco.

Obrigado!`;
}

/**
 * Mensagem de notificação para o profissional sobre novo agendamento
 */
export function getProfessionalNotificationMessage(data: {
     patientName: string;
     patientPhone: string;
     serviceName: string;
     date: string;
     time: string;
}): string {
     return `🔔 Novo Agendamento!

👤 Cliente: ${data.patientName}
📞 Telefone: ${data.patientPhone}
📋 Serviço: ${data.serviceName}
📅 Data: ${data.date}
⏰ Horário: ${data.time}`;
}

/**
 * Mensagem de cancelamento para o cliente
 */
export function getCancellationMessage(data: {
     patientName: string;
     serviceName: string;
     date: string;
     time: string;
}): string {
     return `Olá ${data.patientName},

Seu agendamento foi cancelado:

📋 Serviço: ${data.serviceName}
📅 Data: ${data.date}
⏰ Horário: ${data.time}

Para reagendar, entre em contato conosco.`;
}

/**
 * Abre o WhatsApp Web/App com a mensagem
 */
export function openWhatsApp(phone: string, message: string): void {
     const link = generateWhatsAppLink(phone, message);
     window.open(link, "_blank");
}
