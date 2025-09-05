"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "../../lib/types";
import { useState } from "react";
import { Menu, X, Calendar, ClipboardList, Settings } from "lucide-react";
import defaultAvatar from "@/app/assets/images/user.png";

interface AdminHeaderProps {
    user: User;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // ✅ Admin navigation items
    const navItems = [
        { href: "/dashboard/admin/events", label: "Events", icon: Calendar },
        { href: "/dashboard/admin/registrations", label: "Registrations", icon: ClipboardList },
        { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    ];

    const avatarSrc = user?.avatarUrl || defaultAvatar;

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold text-[var(--brand-primary)]">
                        EventFlow Admin
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-6 md:flex">
                        {navItems.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 text-sm font-medium transition hover:text-primary ${pathname?.includes(href)
                                        ? "text-[var(--brand-primary)]"
                                        : "text-gray-600"
                                    }`}
                            >
                                <Icon size={18} />
                                {label}
                            </Link>
                        ))}
                        {/* Divider */}
                        <span className="h-6 w-px bg-gray-300" />
                        {/* User */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                                <Image
                                    src={avatarSrc}
                                    alt="avatar"
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span className="text-sm text-gray-700">
                                Hi{user?.name ? `, ${user.name}` : ""}
                            </span>
                        </div>
                    </nav>

                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6 text-gray-700" />
                    </button>
                </div>
            </header>

            {/* Mobile Nav Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="relative ml-auto flex h-full w-64 flex-col bg-white shadow-xl z-50">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <span className="text-lg font-bold text-[var(--brand-primary)]">
                                Admin Menu
                            </span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="h-6 w-6 text-gray-700" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-4 p-4">
                            {navItems.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 text-base font-medium transition hover:text-[var(--brand-primary)] ${pathname?.includes(href)
                                            ? "text-[var(--brand-primary)]"
                                            : "text-gray-600"
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon size={20} />
                                    {label}
                                </Link>
                            ))}
                            <div className="mt-4 flex items-center gap-3 border-t pt-4">
                                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                                    <Image
                                        src={avatarSrc}
                                        alt="avatar"
                                        width={40}
                                        height={40}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <span className="text-sm text-gray-700">
                                    Hi{user?.name ? `, ${user.name}` : ""}
                                </span>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
