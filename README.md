This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

> This project runs on port **3001**, not the Next.js default 3000 — WSL forwards port 3000 to a separate app on this machine, and the collision made `localhost:3000` land on that app's login page instead of this store.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Catalogue flag

`lib/site-config.ts` has one static switch:

```ts
export const SHOW_CATALOG = false;
```

While it is `false` the site is a pre-launch page — hero, story and contact
only. `/shop`, `/product/*`, `/cart` and `/checkout` return 404, and both
checkout endpoints answer 404 so no order can be placed. Flip it to `true` and
rebuild to open the store.

## Bundle offers

Offers live in `lib/promos.ts`. Each one lists the items it requires and a fixed
bundle price:

| Offer            | Contents                                          | Price | Saving |
| ---------------- | ------------------------------------------------- | ----- | ------ |
| `duo-las-palmas` | 2 × Las Palmas 500g                               | 90    | 10     |
| `trio-200g`      | Smara + بيت الفخامة + الساقية الحمراء (200g each) | 50    | 13     |

Pricing is by **basket matching**, not a coupon code: `priceCart()` greedily
applies offers best-saving-first and charges the leftovers at unit price. A
customer gets the offer whether they tap "أضف العرض" or assemble the same
basket by hand, and loses it if the basket no longer contains the full set. The
same function runs in the cart UI and in `/api/orders`, which is what keeps the
displayed total and the charged total identical.

## Stock

`inStock` on a product hides it entirely. Individual sizes can also be closed
off with `inStock: false` on the variant (see the Las Palmas 200g and 1kg
entries) — those render struck-through and unselectable, and `/api/orders`
rejects them server-side.

## Checkout (cash on delivery)

Orders are stored in MongoDB. Copy `.env.example` to `.env.local` and set a
connection string:

```bash
cp .env.example .env.local
# then edit MONGODB_URI
```

Without `MONGODB_URI` the site still browses fine, but `POST /api/orders`
answers `503` and the checkout form shows "خدمة الطلبات غير مهيّأة حالياً".

| Endpoint                | Method | Purpose                                                          |
| ----------------------- | ------ | ---------------------------------------------------------------- |
| `/api/checkout/config`  | GET    | Predefined delivery cities + fees, default city, payment method   |
| `/api/orders`           | POST   | Validates name/city/phone, reprices from the catalogue, saves     |

Orders land in the `orders` collection:

```js
{
  orderNumber: "KH-7F3K2Q",
  status: "pending",              // pending | confirmed | shipped | cancelled
  paymentMethod: "cod",
  customer: { fullName, phone, city },
  items: [{ slug, name, weightGrams, quantity, unitPriceMAD, lineTotalMAD }],
  subtotalMAD, deliveryFeeMAD, totalMAD,
  createdAt: ISODate(...)
}
```

The client never sends prices — the API recomputes every amount from
`lib/products.ts` and `lib/checkout-config.ts`, so a tampered request cannot
change what an order costs.

**Before taking live orders:** the per-city delivery fees and the
300 د.م. free-delivery threshold in `lib/checkout-config.ts` are placeholders.
Replace them with your real rates.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
