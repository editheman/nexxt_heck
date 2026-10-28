import { notFound } from "next/navigation";

/** Rewrite target for Proxy; renders the root not-found UI with a 404 status. */
export default function Page() {
  notFound();
}
