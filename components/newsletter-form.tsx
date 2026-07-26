"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Input
        type="email"
        placeholder="بريدك الإلكتروني"
        aria-label="البريد الإلكتروني"
      />
      <Button type="submit" variant="brass" size="sm">
        اشترك
      </Button>
    </form>
  );
}
