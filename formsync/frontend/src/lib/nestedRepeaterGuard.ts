import { toast } from 'sonner';
import type { FieldModel } from '../types';

/** True if any repeater appears inside another repeater (or inside a group within a repeater). */
export function formHasNestedRepeater(fields: FieldModel[]): boolean {
    function walk(nodes: FieldModel[], withinRepeater: boolean): boolean {
        for (const n of nodes) {
            if (n.type === 'repeater') {
                if (withinRepeater) return true;
                if (n.children?.length && walk(n.children, true)) return true;
            } else if (n.children?.length && walk(n.children, withinRepeater)) return true;
        }
        return false;
    }
    return walk(fields, false);
}

export function warnIfNestedRepeaterInForm(fields: FieldModel[]): void {
    if (formHasNestedRepeater(fields)) {
        toast.warning('Nested repeaters are not supported in export', {
            description:
                'React and static HTML generators only support one level of repeating blocks. Flatten repeaters inside repeaters or those sections will show a placeholder in generated code.',
            duration: 9000,
        });
    }
}
