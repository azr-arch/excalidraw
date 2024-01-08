"use client";

import { useRecoilState } from "recoil";
import { ColorPicker } from "../color-picker";
import { StrokeWidthPicker } from "../stroke-width-picker";
import { toolState } from "@/state";
import { BackgroundPicker } from "../background-picker";
import { StrokeStylePicker } from "../stroke-style-picker";

export const ToolbarMenu = () => {
    const [selectedTool, _] = useRecoilState(toolState);

    const renderEl: JSX.Element | null =
        selectedTool !== "pan" && selectedTool !== "select" ? (
            <div className="w-[202px] select-none h-fit z-10 bg-white cursor-default rounded-md shadow-spread p-3 space-y-4 absolute top-28 left-5">
                <ColorPicker />
                {/* @ts-ignore */}
                {(selectedTool === "rectangle" || selectedTool === "circle") && (
                    <BackgroundPicker />
                )}
                <StrokeWidthPicker />
                <StrokeStylePicker />
            </div>
        ) : null;

    return renderEl;
};
