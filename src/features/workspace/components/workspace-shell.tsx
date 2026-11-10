"use client";

import {
  Button,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { ActionButton } from "@/components/ui/action-button";
import {
  IconArrowRight,
  IconBriefcase,
  IconBuilding,
  IconChecklist,
  IconClose,
  IconHome,
  IconKey,
  IconLayers,
  IconLogout,
  IconMenu,
  IconSearch,
  IconShield,
  IconUser,
  IconUsers,
} from "@/components/ui/icons";
import {
  useChangePassword,
  useLogout,
  useSession,
  useSwitchAgency,
} from "@/features/auth/auth.hooks";
import type { Workspace } from "@/features/auth/auth.types";
import { initials } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  exact?: boolean;
};

const navigation: Record<Workspace, NavItem[]> = {
  candidate: [
    { href: "/candidate", label: "Overview", icon: IconHome, exact: true },
    { href: "/candidate/profile", label: "Profile", icon: IconUser },
    { href: "/candidate/onboarding", label: "Onboarding", icon: IconChecklist },
    { href: "/candidate/jobs", label: "Open roles", icon: IconBriefcase },
    {
      href: "/candidate/applications",
      label: "Applications",
      icon: IconLayers,
    },
  ],
  staff: [
    { href: "/staff", label: "Overview", icon: IconHome, exact: true },
    { href: "/staff/candidates", label: "Candidates", icon: IconUsers },
    { href: "/staff/team", label: "Team", icon: IconUser },
    { href: "/staff/jobs", label: "Jobs", icon: IconBriefcase },
    { href: "/staff/applications", label: "Applications", icon: IconLayers },
  ],
  platform: [
    {
      href: "/platform",
      label: "Platform overview",
      icon: IconShield,
      exact: true,
    },
  ],
};

const workspaceLabel: Record<Workspace, string> = {
  candidate: "Candidate workspace",
  staff: "Agency workspace",
  platform: "Platform administration",
};

const workspaceShort: Record<Workspace, string> = {
  candidate: "Candidate",
  staff: "Agency",
  platform: "Platform",
};

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const switchAgency = useSwitchAgency();
  const changePassword = useChangePassword();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const unauthenticated = !session.isPending && !session.data;

  useEffect(() => {
    if (!unauthenticated) return;
    const next = encodeURIComponent(pathname || "/");
    router.replace(`/login?next=${next}`);
  }, [pathname, router, unauthenticated]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeSession = session.data;
  const items = useMemo(
    () => (activeSession ? navigation[activeSession.user.workspace] : []),
    [activeSession],
  );
  const currentItem = items.find((item) => isActive(pathname, item));
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, search]);

  if (session.isPending || unauthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse">
            <Brand />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Opening your workspace
          </p>
        </div>
      </div>
    );
  }

  if (session.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="panel max-w-md p-7 text-center">
          <h1 className="display-title text-2xl text-ink">
            The API is not reachable
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {apiErrorMessage(session.error)}
          </p>
          <Button className="mt-5" onClick={() => session.refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const active = session.data;
  if (!active) return null;
  const { user, agency } = active;

  function signOut() {
    logout.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
    });
  }

  function submitPassword() {
    setPasswordError(undefined);
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPasswordOpen(false);
          router.replace("/login?passwordChanged=1");
        },
        onError: (error) => setPasswordError(apiErrorMessage(error)),
      },
    );
  }

  function goTo(href: string) {
    setSearchOpen(false);
    setSearch("");
    router.push(href);
  }

  return (
    <div className="min-h-screen bg-canvas">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-forest-deep/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col overflow-hidden bg-[#0a241d] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-lime/10 blur-3xl"
        />
        <div className="relative flex h-[72px] items-center justify-between px-5">
          <Brand light />
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <IconClose />
          </button>
        </div>

        <div className="relative mx-3 mt-1 rounded-xl border border-white/10 bg-white/[0.045] p-3.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
            {workspaceShort[user.workspace]}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-white">
            {workspaceLabel[user.workspace]}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/50">
            <IconBuilding className="h-3.5 w-3.5" />
            {agency?.name ?? "Job Finder platform"}
          </p>
        </div>

        <nav className="relative mt-6 flex-1 overflow-y-auto px-3">
          <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
            Workspace
          </p>
          <ul className="space-y-1">
            {items.map((item) => {
              const current = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={current ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                      current
                        ? "bg-lime text-forest-deep shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                        : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] ${
                        current
                          ? "text-forest-deep"
                          : "text-white/40 group-hover:text-lime"
                      }`}
                    />
                    {item.label}
                    {current && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-forest-deep/50" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative p-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <IconSearch className="h-4 w-4" />
            Search
            <kbd className="ml-auto rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-white/40">
              ⌘K
            </kbd>
          </button>
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-lime text-[11px] font-bold text-forest-deep">
                {initials(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-white">
                  {user.name}
                </p>
                <p className="truncate text-[10px] text-white/45">
                  {user.label}
                </p>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Sign out"
                title="Sign out"
              >
                <IconLogout className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-4 border-b border-slate-200/80 bg-canvas/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-surface p-2 text-slate-600 hover:text-ink lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <IconMenu />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
                <span>{workspaceShort[user.workspace]}</span>
                <span aria-hidden="true">/</span>
                <span className="text-slate-600">
                  {currentItem?.label.replace(
                    /^(Platform|Candidate|Agency) /,
                    "",
                  ) ?? "Workspace"}
                </span>
              </div>
              <p className="truncate text-[13px] font-semibold text-ink">
                {agency?.name ?? "Job Finder platform"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-ink sm:flex"
            >
              <IconSearch className="h-4 w-4" />
              <span>Search workspace</span>
              <kbd className="ml-4 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                ⌘K
              </kbd>
            </button>

            {user.agencies.length > 1 ? (
              <Dropdown
                label={agency?.name ?? "Select agency"}
                size="sm"
                color="light"
                dismissOnClick
              >
                <DropdownHeader>Agencies</DropdownHeader>
                {user.agencies.map((item) => (
                  <DropdownItem
                    key={item.id}
                    onClick={() => switchAgency.mutate(item.id)}
                    disabled={switchAgency.isPending}
                  >
                    {item.name}
                    {item.id === agency?.id && (
                      <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-emerald-700">
                        Current
                      </span>
                    )}
                  </DropdownItem>
                ))}
              </Dropdown>
            ) : (
              <span className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs font-medium text-slate-600 shadow-sm md:flex">
                <IconBuilding className="h-3.5 w-3.5 text-slate-400" />
                {agency?.name ?? "Job Finder"}
              </span>
            )}

            <Dropdown
              label={
                <span className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[10px] font-bold text-lime">
                    {initials(user.name)}
                  </span>
                  <span className="hidden text-[13px] font-medium sm:block">
                    {user.name.split(" ")[0]}
                  </span>
                </span>
              }
              arrowIcon={false}
              color="light"
              size="sm"
            >
              <DropdownHeader>
                <span className="block text-sm font-medium text-ink">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {user.email}
                </span>
              </DropdownHeader>
              <DropdownItem
                icon={IconKey}
                onClick={() => {
                  setPasswordError(undefined);
                  setCurrentPassword("");
                  setNewPassword("");
                  setPasswordOpen(true);
                }}
              >
                Change password
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={IconLogout} onClick={signOut}>
                Sign out
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10"
        >
          {children}
        </main>
      </div>

      <Modal
        show={searchOpen}
        size="lg"
        onClose={() => setSearchOpen(false)}
        dismissible
      >
        <ModalBody className="p-0">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <IconSearch className="h-5 w-5 text-slate-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pages and actions…"
                aria-label="Search workspace pages"
                className="w-full border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-slate-400 focus:ring-0"
              />
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                ESC
              </kbd>
            </div>
          </div>
          <div className="p-2">
            <p className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
              Go to
            </p>
            {filteredItems.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                No pages match “{search}”.
              </p>
            ) : (
              <ul className="space-y-1">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        onClick={() => goTo(item.href)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-emerald-700">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 font-medium">{item.label}</span>
                        <IconArrowRight className="h-4 w-4 text-slate-400" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ModalBody>
      </Modal>

      <Modal
        show={passwordOpen}
        size="md"
        onClose={() => setPasswordOpen(false)}
        dismissible
      >
        <ModalHeader>Change password</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-600">
              Updating your password signs you out of every active session.
            </p>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="current-password">Current password</Label>
              </div>
              <TextInput
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="new-password">New password</Label>
              </div>
              <TextInput
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                At least 8 characters.
              </p>
            </div>
            {passwordError && (
              <p role="alert" className="text-sm text-coral">
                {passwordError}
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <ActionButton
            color="green"
            onClick={submitPassword}
            disabled={
              changePassword.isPending ||
              currentPassword.length === 0 ||
              newPassword.length < 8
            }
            pending={changePassword.isPending}
          >
            Update password
          </ActionButton>
          <Button color="light" onClick={() => setPasswordOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
