import React, { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-[#0f0f10] text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-12 h-[70px]">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
            AI-UI
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <SignedIn>
            <button
              className="text-sm hover:text-teal-400 transition"
              onClick={() => (window.location.href = "/history")}
            >
              History
            </button>
          </SignedIn>

          {/* Clerk Auth */}
          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-600 transition text-sm font-medium">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-[#141319] border-t border-gray-800 px-5 py-4 space-y-4">
          <SignedIn>
            <button
              className="text-left text-sm hover:text-teal-400 transition"
              onClick={() => (window.location.href = "/history")}
            >
              History
            </button>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-600 transition text-sm font-medium w-fit">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
