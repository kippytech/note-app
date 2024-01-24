import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <div className="p-4 shadow">
      <div className="justify-betweenmax-w-7xl mx-auto flex flex-wrap items-center gap-3">
        <Link href="/notes" className="flex items-center gap-1">
          <Image src="/brainy.png" alt="brainy logo" height={40} width={40} />
          <span className="font-bold">brainy</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button>
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
  );
}

export default Navbar;
