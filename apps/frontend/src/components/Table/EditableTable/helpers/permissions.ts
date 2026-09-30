/**
 * Checks if user has edit permissions for a specific item.
 * Si la página no declara qué permiso exige, se assume que no se tiene: así un
 * `permissionMap` olvidado deja la columna de acciones oculta en vez de abrirla
 * para cualquiera.
 */
export const checkEditPermissions = (
  permissions: string[] | undefined,
  itemPermissions?: string[],
): boolean => {
  if (!permissions || !itemPermissions?.length) return false;

  return itemPermissions.some((permission) => permissions.includes(permission));
};

/**
 * Checks if user has delete permissions for a specific item.
 * Mismo criterio que {@link checkEditPermissions}: sin `permissionMap` no se
 * habilita la acción.
 */
export const checkDeletePermissions = (
  permissions: string[] | undefined,
  itemPermissions?: string[],
): boolean => {
  if (!permissions || !itemPermissions?.length) return false;

  return itemPermissions.some((permission) => permissions.includes(permission));
}; 