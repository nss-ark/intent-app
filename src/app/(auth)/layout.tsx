export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F8FB] safe-top safe-bottom">
      {children}
    </div>
  );
}
