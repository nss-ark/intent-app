export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#FAFAF6] safe-top safe-bottom">
      {children}
    </div>
  );
}
