
export const Role = {
  Client: 'Client',
  Support: 'Support',
  Manager: 'Manager',
  Admin: 'Admin',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const TicketStatus = {
  Waiting: 'Waiting',
  InProgress: 'In progress',
  Done: 'Done',
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
} as const;
export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority];

export const CommentType = {
  Public: 'Публичный',
  Internal: 'Внутренний',
} as const;
export type CommentType = (typeof CommentType)[keyof typeof CommentType];

// ─── Auth ───

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
}


export interface JwtPayload {
  /** User ID (ClaimTypes.NameIdentifier) */
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  /** Role (ClaimTypes.Role) */
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  /** Email */
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  exp: number;
  iss: string;
  aud: string;
}

// ─── User ───

export interface UserResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export interface UpdateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

// ─── Ticket ───

export interface TicketResponseDTO {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  createdById: string;
  assignedToId: string | null;
}

export interface CreateTicketByClientDTO {
  title: string;
  description: string;
}

export interface CreateTicketBySupportDTO {
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedToId?: string | null;
  createdForClientId?: string | null;
}

export interface UpdateTicketDTO {
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedToId?: string | null;
}

/** Support only — change status */
export interface UpdateTicketStatusDTO {
  status: string;
}

/** Manager only — assign + priority */
export interface AssignTicketDTO {
  assignedToId?: string | null;
  priority?: string | null;
}

/** Manager only — change user role */
export interface ChangeUserRoleDTO {
  role: string;
}

// ─── Comment ───

export interface CommentResponseDTO {
  id: string;
  text: string;
  type: string;
  createdAt: string;
  authorId: string;
  ticketId: string;
}

export interface CreateCommentByClientDTO {
  text: string;
}

export interface CreateCommentBySupportDTO {
  text: string;
  type: string;
}

// ─── Ticket History ───

export interface TicketHistoryDTO {
  id: string;
  oldStatus: string;
  newStatus: string;
  changedAt: string;
  changedById: string;
  ticketId: string;
}

// ─── Audit Log ───

export interface AuditLogResponseDTO {
  id: string;
  operation: string;
  description: string;
  createdAt: string;
  authorOfChangesId: string;
  ticketId: string | null;
}
