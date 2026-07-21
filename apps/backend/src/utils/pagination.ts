import type { PaginationParams, PaginatedResult, QueryParams } from "@choferes/shared";

// Re-export QueryParams for services that import from this module
export type { QueryParams };

/**
 * Parse and validate pagination parameters from query string.
 * Returns defaults (page=1, limit=50) if params are missing or invalid.
 */
export function getPaginationParams(query: QueryParams): PaginationParams {
  let page = parseInt(query.page || "1", 10);
  let limit = parseInt(query.limit || "50", 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 50;
  if (limit > 10000) limit = 10000; // cap at 10000 to prevent abuse

  return { page, limit };
}

/**
 * Extract the search term from query params.
 * Returns undefined if no search param is provided or it's empty.
 */
export function getSearchParam(query: QueryParams): string | undefined {
  const search = query.search?.trim();
  return search && search.length > 0 ? search : undefined;
}

/**
 * Build a Sequelize WHERE clause that searches across multiple fields using ILIKE.
 * Uses Sequelize v3 string-based operators ($or, $iLike).
 * Returns undefined if no search term is provided, so it can be spread safely.
 *
 * @param search - The search term to look for
 * @param fields - Array of field names to search across
 * @returns A WHERE clause object or undefined
 */
export function buildSearchWhere(
  search: string | undefined,
  fields: string[],
): Record<string, any> | undefined {
  if (!search || fields.length === 0) return undefined;

  return {
    $or: fields.map((field) => ({
      [field]: { $iLike: `%${search}%` },
    })),
  };
}

/**
 * Wraps Sequelize's findAndCountAll to return a standardized paginated response.
 *
 * @param model - Sequelize model class (constructor)
 * @param options - findAndCountAll options (where, include, order, etc.)
 * @param params - pagination params with page and limit
 * @returns PaginatedResult with data array and pagination metadata
 */
export async function paginate<T = any>(
  model: any,
  options: Record<string, any>,
  params: PaginationParams,
): Promise<PaginatedResult<T>> {
  const { page, limit } = params;
  const offset = (page - 1) * limit;

  const result = await model.findAndCountAll({
    ...options,
    offset,
    limit,
  });

  const totalPages = Math.ceil(result.count / limit);

  return {
    data: result.rows as T[],
    pagination: {
      page,
      limit,
      totalItems: result.count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
