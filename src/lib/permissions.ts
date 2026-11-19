export type StaffRole =
  | "SUPER_ADMIN"
  | "CENTER_ADMIN"
  | "RECEPTIONIST"
  | "DOCTOR"
  | "LAB_TECHNICIAN"
  | "PATHOLOGIST"
  | "ACCOUNTANT"
  | "PATIENT";

export const routeAccess: Array<{ prefix: string; roles: StaffRole[] }> = [
  { prefix: "/admin", roles: ["SUPER_ADMIN", "CENTER_ADMIN", "RECEPTIONIST", "DOCTOR", "LAB_TECHNICIAN", "PATHOLOGIST", "ACCOUNTANT"] },
  { prefix: "/admin/dashboard", roles: ["SUPER_ADMIN", "CENTER_ADMIN", "RECEPTIONIST", "ACCOUNTANT"] },
  { prefix: "/admin/doctors", roles: ["SUPER_ADMIN", "CENTER_ADMIN"] },
  { prefix: "/admin/staff", roles: ["SUPER_ADMIN", "CENTER_ADMIN"] },
  { prefix: "/admin/opd", roles: ["SUPER_ADMIN", "CENTER_ADMIN", "RECEPTIONIST"] },
  { prefix: "/admin/consultations", roles: ["SUPER_ADMIN", "CENTER_ADMIN", "DOCTOR", "PATHOLOGIST"] },
  { prefix: "/admin/patients", roles: ["SUPER_ADMIN", "CENTER_ADMIN", "RECEPTIONIST", "DOCTOR", "PATHOLOGIST", "ACCOUNTANT"] },
  { prefix: "/admin/lab", roles: ["SUPER_ADMIN", "CENTER_ADMIN", "LAB_TECHNICIAN", "PATHOLOGIST"] },
  { prefix: "/admin/pathology", roles: ["SUPER_ADMIN", "CENTER_ADMIN", "PATHOLOGIST"] },
  { prefix: "/admin/billing", roles: ["SUPER_ADMIN", "CENTER_ADMIN", "RECEPTIONIST", "ACCOUNTANT"] },
  { prefix: "/admin/audit", roles: ["SUPER_ADMIN", "CENTER_ADMIN"] },
];

export function rolesForPath(pathname: string): StaffRole[] {
  return routeAccess
    .slice()
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((route) => pathname.startsWith(route.prefix))?.roles || [];
}

export function hasPortalAccess(role: string | undefined, pathname: string): boolean {
  if (!role) return false;
  const roles = rolesForPath(pathname);
  return roles.length > 0 && roles.includes(role as StaffRole);
}

export function defaultPortalForRole(role: string | undefined): string {
  switch (role) {
    case "PATIENT": return "/customer";
    case "DOCTOR": return "/doctor";
    case "LAB_TECHNICIAN": return "/admin/lab";
    case "PATHOLOGIST": return "/admin/pathology";
    case "RECEPTIONIST": return "/admin/opd";
    case "ACCOUNTANT": return "/admin/billing";
    default: return "/admin/dashboard";
  }
}
