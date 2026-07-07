import React, {useLayoutEffect, useRef, useState} from "react";
import {MdInfoOutline} from "react-icons/md";
import {classes} from "./utils";

interface Props {
    content: string;
    className?: string;
}

const TOOLTIP_WIDTH = 256; // px, matches w-64
const VIEWPORT_MARGIN = 8;

type Align = "left" | "center" | "right";

const FieldTooltip: React.FC<Props> = ({content, className}) => {
    const [open, setOpen] = useState(false);
    const [align, setAlign] = useState<Align>("center");
    const buttonRef = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
        if (!open || !buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        if (center - TOOLTIP_WIDTH / 2 < VIEWPORT_MARGIN) {
            setAlign("left");
        } else if (center + TOOLTIP_WIDTH / 2 > window.innerWidth - VIEWPORT_MARGIN) {
            setAlign("right");
        } else {
            setAlign("center");
        }
    }, [open]);

    if (!content) return null;

    const alignClasses = {
        left: "left-0",
        center: "left-1/2 -translate-x-1/2",
        right: "right-0"
    }[align];

    return (
        <span className={classes("relative inline-flex items-center", className ?? "ml-1")}>
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOpen((o) => !o);
                }}
                className="text-gray-400 hover:text-primary-600 normal-case font-normal"
            >
                <MdInfoOutline size={14}/>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-[99998]" onClick={() => setOpen(false)}/>
                    <span
                        className={classes(
                            "absolute z-[99999] top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs font-normal normal-case rounded shadow-lg w-64 whitespace-pre-line",
                            alignClasses
                        )}>
                        {content}
                    </span>
                </>
            )}
        </span>
    );
};

export default FieldTooltip;
