import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Needs lib/utils
// We'll create a single file for UI components for simplicity in template or assumes they exist
// The export plugin assumes they are in '../components/ui'
export * from './input';
export * from './button';
export * from './label';
export * from './textarea';
export * from './checkbox';
export * from './select';
export * from './card';
