/**
 * Store identity/contact info shown across the site (header, footer, landing
 * pages) and used for order-alert WhatsApp delivery. Editable from
 * /admin/settings instead of being hardcoded, so the shop owner can change
 * their name, phone, email, and alert numbers without a code change.
 */
export type SiteSettings = {
  storeName: string;
  /** Public contact number shown in the footer and used for the WhatsApp click-to-chat button. */
  contactPhone: string;
  /** Public contact email — hidden from the site entirely when null/empty. */
  contactEmail: string | null;
  address: string;
  /** WhatsApp numbers that receive a notification for every new order. */
  orderAlertPhones: string[];
  /** Whether the customer themselves gets the WhatsApp order-confirmation message. Order-alert numbers always get theirs regardless. */
  sendCustomerWhatsApp: boolean;
};
