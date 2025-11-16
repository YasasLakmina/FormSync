// Conceptual Plugin Interfaces (Placeholder)

export interface FieldPlugin {
    type: string;
    render: () => void; // Placeholder
}

export interface FormGeneratorConfig {
    plugins: FieldPlugin[];
}
