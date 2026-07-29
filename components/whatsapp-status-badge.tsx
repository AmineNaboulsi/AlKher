import { CheckCircle2, XCircle, AlertTriangle, Clock, MessageCircleOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WhatsAppOrderStatus } from "@/lib/admin-whatsapp-repo";

const CONFIG: Record<
  WhatsAppOrderStatus,
  {
    label: string;
    variant: "mint" | "clay" | "outline" | "muted";
    Icon: typeof CheckCircle2;
  }
> = {
  sent: { label: "تم إرسال واتساب", variant: "mint", Icon: CheckCircle2 },
  partial: {
    label: "إرسال جزئي لواتساب",
    variant: "clay",
    Icon: AlertTriangle,
  },
  failed: { label: "فشل إرسال واتساب", variant: "clay", Icon: XCircle },
  unsent: {
    label: "لم يُرسل واتساب",
    variant: "muted",
    Icon: MessageCircleOff,
  },
  pending: {
    label: "إرسال واتساب قيد التنفيذ",
    variant: "outline",
    Icon: Clock,
  },
};

export function WhatsAppStatusBadge({
  status,
}: {
  status: WhatsAppOrderStatus;
}) {
  const { label, variant, Icon } = CONFIG[status];
  return (
    <Badge variant={variant} className="w-full justify-center gap-1.5 py-1.5">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
