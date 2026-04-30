import { resolveNames } from './name-resolver';
import type { NameVariants, RenderedService, Template } from './types';

/**
 * Hard-coded template names (purchase-request-comment).
 */
export const TEMPLATE_NAMES: NameVariants = resolveNames('purchase-request-comment');

/**
 * Render template strings for a target service.
 * Substitutes every form of the entity name (kebab/snake/pascal/camel + Full + parentIdField).
 *
 * Order: longest tokens first — *Full before bare entity, snakeFull (with _comment)
 * before snake (without). This prevents 'purchase-request' from matching inside
 * 'purchase-request-comment' as a partial replacement.
 */
export function render(
  template: Template,
  to: NameVariants,
  from: NameVariants = TEMPLATE_NAMES,
): RenderedService {
  return {
    controller: substituteAll(template.controller, from, to),
    service: substituteAll(template.service, from, to),
    module: substituteAll(template.module, from, to),
  };
}

function substituteAll(input: string, from: NameVariants, to: NameVariants): string {
  // Substitution pairs ordered longest-first to prevent overlap.
  const pairs: Array<[string, string]> = [
    [from.parentIdField, to.parentIdField], // 'purchase_request_id' (longest specific token)
    [from.snakeFull, to.snakeFull],         // 'purchase_request_comment'
    [from.kebabFull, to.kebabFull],         // 'purchase-request-comment'
    [from.pascalFull, to.pascalFull],       // 'PurchaseRequestComment'
    [from.camelFull, to.camelFull],         // 'purchaseRequestComment'
    [from.snake, to.snake],                 // 'purchase_request'
    [from.kebab, to.kebab],                 // 'purchase-request'
    [from.pascal, to.pascal],               // 'PurchaseRequest'
    [from.camel, to.camel],                 // 'purchaseRequest'
  ];

  let out = input;
  for (const [search, replace] of pairs) {
    if (search === replace) continue;
    out = out.split(search).join(replace);
  }
  return out;
}
