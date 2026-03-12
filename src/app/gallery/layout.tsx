import { AppLayout } from "@/components/layout/app-layout";

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
