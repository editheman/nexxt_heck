export default function AppLayout({ children }: LayoutProps<"/">) {
  return <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 sm:py-14 short:sm:py-6 lg:px-8">{children}</div>;
}
