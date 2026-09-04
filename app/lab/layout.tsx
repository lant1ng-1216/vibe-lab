import { ReactNode } from "react";
import Sidebar from "@/components/lab/Sidebar";

export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lab4-layout">
      <Sidebar />
      <main className="lab4-main">{children}</main>
    </div>
  );
}
