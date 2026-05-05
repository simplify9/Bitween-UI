import React from "react";

interface Props {
    content: string;
    children: React.ReactNode;
    placement?: "top" | "bottom" | "right" | "left";
    className?: string;
}

const placementClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
};

const Tooltip: React.FC<Props> = ({ content, children, placement = "top", className }) => {
    if (!content) return <>{children}</>;
    return (
        <div className={`relative group/tooltip ${className ?? "inline-flex"}`}>
            {children}
            <span
                className={`absolute ${placementClasses[placement]} z-[99999] px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 pointer-events-none select-none`}
            >
                {content}
            </span>
        </div>
    );
};

export default Tooltip;
