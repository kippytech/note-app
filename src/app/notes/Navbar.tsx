"use client";

import AddEditNote from "@/components/AddEditNote";
import ThemeToggleBtn from "@/components/ThemeToggleBtn";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { dark } from "@clerk/themes";
import { useState } from "react";
import ChatButton from "@/components/ChatButton";

function Navbar() {
  const [showDialog, setShowDialog] = useState(false);
  const { theme } = useTheme();
  return (
    <>
      <div className="p-4 shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/notes" className="flex items-center gap-1">
            <Image src="/logo.png" alt="brainy logo" height={40} width={40} />
            <span className="font-bold italic">brainy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowDialog(true)}>
              <Plus size={20} className="mr-2" />
              Add note
            </Button>
            <ChatButton />
            <ThemeToggleBtn />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
                baseTheme: theme === "dark" ? dark : undefined,
              }}
            />
          </div>
        </div>
      </div>
      <AddEditNote open={showDialog} setOpen={setShowDialog} />
    </>
  );
}

export default Navbar;
