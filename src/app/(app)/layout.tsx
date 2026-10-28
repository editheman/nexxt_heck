export default function AppLayout({ children }: LayoutProps<"/">) {
  return <div className="mx-auto w-full max-w-[1120px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">{children}</div>;
}
