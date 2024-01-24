"use client";

import AddEditNote from "@/components/AddEditNote";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

function Navbar() {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <div className="p-4 shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/notes" className="flex items-center gap-1">
            <Image src="/brainy.png" alt="brainy logo" height={40} width={40} />
            <span className="font-bold">brainy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowDialog(true)}>
              <Plus size={20} className="mr-2" />
              Add note
            </Button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
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
