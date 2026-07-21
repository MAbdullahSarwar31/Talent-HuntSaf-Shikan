/** Role definition — used for auth guards and conditional rendering, structured for erasableSyntaxOnly compliance. */
export const UserRole = {
  OPERATOR: 'operator',
  ADMIN:    'admin',
  MANAGER:  'manager',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Default redirect path per role after successful login. */
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  [UserRole.OPERATOR]: '/login',
  [UserRole.ADMIN]:    '/admin/bi/overview',
  [UserRole.MANAGER]:  '/admin/bi/overview',
};
