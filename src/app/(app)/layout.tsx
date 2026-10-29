import { FriendsPanel } from "@/components/friends/FriendsPanel";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    // From xl the container spans the full width so the friends column sits near the right edge
    // and the page content gets the rest (still capped at 1120 px and centred in it).
    <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 sm:py-14 short:sm:py-6 lg:px-8 xl:flex xl:max-w-none xl:gap-8 xl:pr-6">
      <div className="mx-auto w-full min-w-0 max-w-[1120px] xl:flex-1">{children}</div>
      {/* Logged in only; a right column from xl (1280px), below the content on smaller screens. */}
      <FriendsPanel />
    </div>
  );
}
