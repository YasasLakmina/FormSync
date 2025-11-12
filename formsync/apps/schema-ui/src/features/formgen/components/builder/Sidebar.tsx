import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '../../store';
import { cn } from '../../lib/utils';
import { Type, Mail, CheckSquare, List, Hash, AlignLeft, GripVertical } from 'lucide-react';

export function Sidebar({ className }: { className?: string }) {
    const { currentForm, reorderFields, selectField, selectedFieldId } = useEditorStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const order = currentForm?.layout?.order || [];
    const fieldMap = new Map(currentForm?.fields.map(f => [f.id, f]));
    const items = order.filter(id => fieldMap.has(id));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = order.indexOf(active.id as string);
            const newIndex = order.indexOf(over?.id as string);
            reorderFields(arrayMove(order, oldIndex, newIndex));
        }
    };

    return (
        <div className={cn("flex flex-col bg-white border-r", className)}>
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm text-gray-900">Fields</h2>
                <p className="text-xs text-gray-500 mt-1">Drag to reorder</p>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="p-3 space-y-2 overflow-y-auto flex-1">
                        {items.map(id => {
                            const field = fieldMap.get(id);
                            if (!field) return null;
                            return (
                                <SortableField
                                    key={id}
                                    id={id}
                                    field={field}
                                    isSelected={selectedFieldId === id}
                                    onClick={() => selectField(id)}
                                />
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

function SortableField({ id, field, isSelected, onClick }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    const getIcon = (type: string, widget?: string) => {
        if (type === 'string' || type === 'text') { // Handle 'text' alias if exists or just string
            if (widget === 'textarea') return <AlignLeft className="w-4 h-4" />;
            return <Type className="w-4 h-4" />;
        }
        if (type === 'email') return <Mail className="w-4 h-4" />;
        if (type === 'number') return <Hash className="w-4 h-4" />;
        if (type === 'boolean') return <CheckSquare className="w-4 h-4" />;
        if (type === 'array' || type === 'select') return <List className="w-4 h-4" />;
        return <Type className="w-4 h-4" />;
    };

    const isRequired = field.constraints?.some((c: any) => c.type === 'required');

    return (
        <div ref={setNodeRef} style={style} {...attributes}
            onClick={onClick}
            className={cn(
                "group flex items-center gap-3 p-3 rounded-md border text-sm cursor-pointer transition-all",
                isSelected
                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 z-10"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm",
                isDragging && "opacity-50 shadow-lg scale-105 bg-gray-50"
            )}>
            <div {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
            </div>

            <div className={cn(
                "w-8 h-8 rounded flex items-center justify-center text-gray-500",
                isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 group-hover:bg-gray-200"
            )}>
                {getIcon(field.type, field.ui.widget)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-medium truncate flex items-center gap-1.5">
                    {field.ui.label || field.key}
                    {isRequired && <span className="text-red-500 text-xs" title="Required">*</span>}
                </div>
                <div className="text-xs text-gray-500 truncate font-mono opacity-80">
                    {field.key} <span className="text-gray-300">|</span> {field.type}
                </div>
            </div>
        </div>
    );
}
