"use client";

import {
  Avatar,
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
  Spinner,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { ActionButton } from "@/components/ui/action-button";
import {
  IconBriefcase,
  IconBuilding,
  IconChecklist,
  IconClose,
  IconHome,
  IconKey,
  IconLayers,
  IconLogout,
  IconMenu,
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
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const unauthenticated = !session.isPending && !session.data;

  useEffect(() => {
    if (!unauthenticated) return;
    const next = encodeURIComponent(pathname || "/");
    router.replace(`/login?next=${next}`);
  }, [pathname, router, unauthenticated]);

  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  if (session.isPending || unauthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner size="sm" />
          Loading your workspace…
        </div>
      </div>
    );
  }

  if (session.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            The API is not reachable
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {apiErrorMessage(session.error)}
          </p>
          <Button className="mt-4" onClick={() => session.refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const activeSession = session.data;
  if (!activeSession) return null;
  const { user, agency } = activeSession;
  const items = navigation[user.workspace];

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

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Brand />
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {workspaceLabel[user.workspace]}
          </p>
          <nav className="space-y-1">
            {items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <IconBuilding className="h-4 w-4 text-slate-400" />
              {agency?.name ?? "Platform access"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {user.label} account
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <IconMenu />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {workspaceLabel[user.workspace]}
              </p>
              <p className="truncate text-xs text-slate-500">
                {agency?.name ?? "Job Finder platform"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.agencies.length > 1 && (
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
                      <span className="ml-2 text-xs text-emerald-600">
                        Current
                      </span>
                    )}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}

            <Dropdown
              label={
                <span className="flex items-center gap-2">
                  <Avatar
                    placeholderInitials={initials(user.name)}
                    rounded
                    size="xs"
                  />
                  <span className="hidden text-sm font-medium sm:block">
                    {user.name}
                  </span>
                </span>
              }
              arrowIcon={false}
              color="light"
              size="sm"
            >
              <DropdownHeader>
                <span className="block text-sm font-medium text-slate-900">
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
          className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>

      <Modal
        show={passwordOpen}
        size="md"
        onClose={() => setPasswordOpen(false)}
        dismissible
      >
        <ModalHeader>Change password</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
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
              <p role="alert" className="text-sm text-red-600">
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
