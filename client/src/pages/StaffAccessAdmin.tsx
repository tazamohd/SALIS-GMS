import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, RefreshCw, Ticket, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { extractApiMessage } from "@/lib/apiError";
import { PageHeader } from "@/components/PageHeader";

interface RoleOption {
  roleKey: string;
  name: string;
  description: string;
}

interface Invite {
  id: string;
  code: string;
  email: string | null;
  roleKey: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
  redeemable: boolean;
}

interface StaffApplicationRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  requestedRoleKey: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

/**
 * The business side of staff access: issue invite codes, hand out the workplace
 * code, and approve or reject the people who applied with it. Approving is
 * where the role is actually decided — an applicant's stated job is only a
 * suggestion.
 */
export default function StaffAccessAdmin() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchJson = async (url: string) => {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message ?? "Request failed");
    return res.json();
  };

  const roles = useQuery<RoleOption[]>({ queryKey: ["/api/staff/roles"], queryFn: () => fetchJson("/api/staff/roles") });
  const invites = useQuery<Invite[]>({ queryKey: ["/api/staff/invites"], queryFn: () => fetchJson("/api/staff/invites") });
  const applications = useQuery<StaffApplicationRow[]>({
    queryKey: ["/api/staff/applications"],
    queryFn: () => fetchJson("/api/staff/applications?status=pending"),
  });
  const joinCode = useQuery<{ joinCode: string }>({
    queryKey: ["/api/staff/join-code"],
    queryFn: () => fetchJson("/api/staff/join-code"),
  });

  const [newInvite, setNewInvite] = useState({ roleKey: "TECHNICIAN", email: "", maxUses: 1, expiresInDays: 14 });

  const invalidate = (key: string) => queryClient.invalidateQueries({ queryKey: [key] });
  const onError = (title: string) => (error: Error) =>
    toast({ title, description: extractApiMessage(error), variant: "destructive" });

  const createInvite = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/staff/invites", {
        ...newInvite,
        email: newInvite.email.trim() || undefined,
      })).json(),
    onSuccess: () => {
      invalidate("/api/staff/invites");
      toast({ title: t("staffAccess.inviteCreated", "Invite created") });
    },
    onError: onError(t("staffAccess.inviteFailed", "Could not create the invite")),
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => (await apiRequest("POST", `/api/staff/invites/${id}/revoke`)).json(),
    onSuccess: () => invalidate("/api/staff/invites"),
    onError: onError(t("staffAccess.revokeFailed", "Could not revoke the invite")),
  });

  const regenerate = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/staff/join-code/regenerate")).json(),
    onSuccess: () => {
      invalidate("/api/staff/join-code");
      toast({ title: t("staffAccess.codeRegenerated", "New workplace code issued") });
    },
    onError: onError(t("staffAccess.regenerateFailed", "Could not issue a new code")),
  });

  const decide = useMutation({
    mutationFn: async ({ id, action, roleKey }: { id: string; action: "approve" | "reject"; roleKey?: string }) =>
      (await apiRequest("POST", `/api/staff/applications/${id}/${action}`, roleKey ? { roleKey } : {})).json(),
    onSuccess: (_data, variables) => {
      invalidate("/api/staff/applications");
      toast({
        title:
          variables.action === "approve"
            ? t("staffAccess.approved", "Approved — they can sign in now")
            : t("staffAccess.rejected", "Request rejected"),
      });
    },
    onError: onError(t("staffAccess.decisionFailed", "Could not update the request")),
  });

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(
      () => toast({ title: t("staffAccess.copied", "Copied") }),
      () => toast({ title: t("staffAccess.copyFailed", "Could not copy"), variant: "destructive" }),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("staffAccess.title", "Team access")}
        description={t("staffAccess.description", "Invite people directly, or share your workplace code and approve who applies.")}
      />

      {/* Workplace code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("staffAccess.workplaceCode", "Workplace code")}</CardTitle>
          <CardDescription>
            {t("staffAccess.workplaceCodeHelp", "Anyone with this code can request to join at /staff/apply. It grants nothing until you approve them.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-[#F1F5F9] dark:bg-[#0E1117] px-4 py-2 text-lg font-semibold tracking-[0.3em]" data-testid="text-join-code">
            {joinCode.isLoading ? "…" : (joinCode.data?.joinCode ?? "—")}
          </code>
          <Button type="button" variant="outline" onClick={() => copy(joinCode.data?.joinCode ?? "")} disabled={!joinCode.data?.joinCode} data-testid="button-copy-join-code">
            <Copy className="h-4 w-4" />
            {t("common.copy", "Copy")}
          </Button>
          <Button type="button" variant="outline" onClick={() => regenerate.mutate()} disabled={regenerate.isPending} data-testid="button-regenerate-code">
            <RefreshCw className="h-4 w-4" />
            {t("staffAccess.regenerate", "Issue a new code")}
          </Button>
        </CardContent>
      </Card>

      {/* Pending applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("staffAccess.pending", "Waiting for your approval")}</CardTitle>
          <CardDescription>{t("staffAccess.pendingHelp", "You choose the role that is granted — their answer is only a hint.")}</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#0A5ED7]" />
          ) : (applications.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-[#64748B] dark:text-[#9BA4B0]">{t("staffAccess.noPending", "Nothing waiting.")}</p>
          ) : (
            <ul className="space-y-3">
              {applications.data!.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  roles={roles.data ?? []}
                  busy={decide.isPending}
                  onDecide={(action, roleKey) => decide.mutate({ id: application.id, action, roleKey })}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Invites */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("staffAccess.invites", "Invite codes")}</CardTitle>
          <CardDescription>{t("staffAccess.invitesHelp", "An invite carries the role with it — redeeming one creates the account immediately.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createInvite.mutate();
            }}
            className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
          >
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">{t("staffAccess.role", "Role")}</Label>
              <select
                value={newInvite.roleKey}
                onChange={(e) => setNewInvite((i) => ({ ...i, roleKey: e.target.value }))}
                data-testid="select-invite-role"
                className="h-10 w-full rounded-md border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#0E1117] px-3 text-sm"
              >
                {(roles.data ?? []).map((role) => (
                  <option key={role.roleKey} value={role.roleKey}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("staffAccess.lockToEmail", "Lock to email")}</Label>
              <Input
                type="email"
                placeholder={t("staffAccess.optional", "Optional")}
                value={newInvite.email}
                onChange={(e) => setNewInvite((i) => ({ ...i, email: e.target.value }))}
                data-testid="input-invite-email"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("staffAccess.uses", "Uses")}</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newInvite.maxUses}
                onChange={(e) => setNewInvite((i) => ({ ...i, maxUses: Number(e.target.value) || 1 }))}
                data-testid="input-invite-uses"
                className="h-10"
              />
            </div>
            <Button type="submit" disabled={createInvite.isPending} data-testid="button-create-invite" className="h-10 bg-[#0A5ED7] text-white hover:bg-[#0952C0]">
              <Ticket className="h-4 w-4" />
              {t("staffAccess.createInvite", "Create")}
            </Button>
          </form>

          {invites.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#0A5ED7]" />
          ) : (invites.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-[#64748B] dark:text-[#9BA4B0]">{t("staffAccess.noInvites", "No invites yet.")}</p>
          ) : (
            <ul className="divide-y divide-[#E2E8F0] dark:divide-[#232A36]">
              {invites.data!.map((invite) => (
                <li key={invite.id} className="flex flex-wrap items-center gap-3 py-3" data-testid={`invite-${invite.code}`}>
                  <code className="rounded bg-[#F1F5F9] dark:bg-[#0E1117] px-3 py-1 text-sm font-semibold tracking-widest">{invite.code}</code>
                  <span className="text-sm text-[#0B1F3B] dark:text-[#E6EAF0]">{invite.roleKey}</span>
                  {invite.email && <span className="text-xs text-[#64748B]">{invite.email}</span>}
                  <span className="text-xs text-[#64748B]">
                    {t("staffAccess.usage", "{{used}} of {{max}} used", { used: invite.usedCount, max: invite.maxUses })}
                  </span>
                  {!invite.redeemable && (
                    <span className="rounded-full bg-[#F1F5F9] dark:bg-[#0E1117] px-2 py-0.5 text-xs text-[#64748B]">
                      {invite.revokedAt ? t("staffAccess.revoked", "Revoked") : t("staffAccess.spent", "No longer usable")}
                    </span>
                  )}
                  <div className="ms-auto flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => copy(invite.code)} data-testid={`button-copy-${invite.code}`}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {invite.redeemable && (
                      <Button type="button" variant="outline" size="sm" onClick={() => revoke.mutate(invite.id)} disabled={revoke.isPending} data-testid={`button-revoke-${invite.code}`}>
                        {t("staffAccess.revoke", "Revoke")}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationRow({
  application,
  roles,
  busy,
  onDecide,
}: {
  application: StaffApplicationRow;
  roles: RoleOption[];
  busy: boolean;
  onDecide: (action: "approve" | "reject", roleKey?: string) => void;
}) {
  const { t } = useTranslation();
  const [roleKey, setRoleKey] = useState(application.requestedRoleKey ?? "TECHNICIAN");

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E2E8F0] dark:border-[#232A36] p-4" data-testid={`application-${application.id}`}>
      <div className="min-w-[200px]">
        <p className="font-semibold text-[#0B1F3B] dark:text-white">{application.fullName}</p>
        <p className="text-sm text-[#64748B] dark:text-[#9BA4B0]">{application.email}</p>
        {application.message && <p className="mt-1 text-xs text-[#94A3B8]">{application.message}</p>}
      </div>

      <select
        value={roleKey}
        onChange={(e) => setRoleKey(e.target.value)}
        data-testid={`select-role-${application.id}`}
        className="h-10 rounded-md border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#0E1117] px-3 text-sm"
      >
        {roles.map((role) => (
          <option key={role.roleKey} value={role.roleKey}>{role.name}</option>
        ))}
      </select>

      <div className="ms-auto flex gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={() => onDecide("approve", roleKey)} data-testid={`button-approve-${application.id}`} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <UserCheck className="h-4 w-4" />
          {t("staffAccess.approve", "Approve")}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onDecide("reject")} data-testid={`button-reject-${application.id}`}>
          <UserX className="h-4 w-4" />
          {t("staffAccess.reject", "Reject")}
        </Button>
      </div>
    </li>
  );
}
