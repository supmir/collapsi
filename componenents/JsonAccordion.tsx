import React from "react";

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue; };
type JsonArray = JsonValue[];

interface JsonAccordionProps {
    data: JsonValue;
    label?: string;
    depth?: number;
}

export const JsonAccordion: React.FC<JsonAccordionProps> = ({
    data,
    label = "",
    depth = 0,
}) => {
    const isObject = typeof data === "object" && data !== null;
    const isArray = Array.isArray(data);

    const indent = `ml-${Math.min(depth * 4, 32)}`; // Tailwind classes cap out

    if (!isObject) {
        return (
            <div className={`text-xs ${indent}`}>
                <span className="text-yellow-300">{label}</span>
                {label && ": "}
                <span className="text-blue-400">{JSON.stringify(data)}</span>
            </div>
        );
    }

    const entries = isArray
        ? (data as JsonArray).map((val, i) => [i, val])
        : Object.entries(data as JsonObject);

    return (
        <details className={`text-xs ${indent}`}>
            <summary className="cursor-pointer font-medium text-green-400">
                {label || (isArray ? "Array" : "Object")}
            </summary>
            <div className="ml-4 mt-1 space-y-1">
                {entries.map(([key, val]) => (
                    <JsonAccordion
                        key={String(key)}
                        label={String(key)}
                        data={val}
                        depth={depth + 1}
                    />
                ))}
            </div>
        </details>
    );
};
