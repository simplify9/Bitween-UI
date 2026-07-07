import React, {useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {MdInfoOutline} from "react-icons/md";
import {classes} from "./utils";

interface Props {
    content: string;
    className?: string;
}

const TOOLTIP_WIDTH = 256; // px, matches w-64
const VIEWPORT_MARGIN = 8;

type Position = {
    top: number
    left: number
}

const FieldTooltip: React.FC<Props> = ({content, className}) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<Position | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Rendered in a portal (position: fixed against the viewport) instead of as a
    // normal absolutely-positioned child — FieldTooltip is used inside FormField,
    // which itself lives inside Modal's scrollable content area (overflow-y-auto).
    // A regularly-positioned popover gets silently clipped by that ancestor's
    // overflow whenever it would render past the modal's own edge, regardless of
    // viewport space. Escaping to document.body sidesteps that entirely — same
    // trick ChoiceEditor already uses (menuPortalTarget={document.body}) for its
    // react-select dropdown.
    useLayoutEffect(() => {
        if (!open || !buttonRef.current) return;

        const updatePosition = () => {
            if (!buttonRef.current) return;
            const rect = buttonRef.current.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            let left = center - TOOLTIP_WIDTH / 2;
            left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN));
            setPosition({top: rect.bottom + 4, left});
        };

        updatePosition();

        // The tooltip's position is computed once on open; if the page scrolls while
        // it's open, close it rather than trying to keep it pinned to the icon.
        const close = () => setOpen(false);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [open]);

    if (!content) return null;

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
            {open && position && createPortal(
                <>
                    {/* z-index must clear Modal's (500000000000) and ChoiceEditor's
                        menuPortal (900000000000) — both are also document.body-level
                        siblings once this is portaled, and plain Tailwind z-utilities
                        don't come close to those inline-style magnitudes. */}
                    <div className="fixed inset-0" style={{zIndex: 950000000000}} onClick={() => setOpen(false)}/>
                    <span
                        style={{top: position.top, left: position.left, width: TOOLTIP_WIDTH, zIndex: 950000000001}}
                        className="fixed px-2 py-1 bg-gray-800 text-white text-xs font-normal normal-case rounded shadow-lg whitespace-pre-line">
                        {content}
                    </span>
                </>,
                document.body
            )}
        </span>
    );
};

export default FieldTooltip;
