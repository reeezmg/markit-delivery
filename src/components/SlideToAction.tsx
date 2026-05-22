import React, { useState, useRef, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { arrowForward } from "ionicons/icons";
import "./SlideToAction.css";

interface SlideToActionProps {
    text?: string;
    color?: string; // e.g., "#28a745" or "var(--ion-color-primary)"
    onSlideComplete: () => void;
    threshold?: number; // default 0.7
    disabled?: boolean;
    disabledText?: string;
    /** Increment to reset slider position (e.g. on Ionic page re-entry) */
    resetTrigger?: number;
}

const SlideToAction: React.FC<SlideToActionProps> = ({
    text = "",
    color = "var(--ion-color-success, #28a745)",
    onSlideComplete,
    threshold = 0.7,
    disabled = false,
    disabledText,
    resetTrigger = 0,
}) => {
    const [sliderPosition, setSliderPosition] = useState(0);

    // Reset slider when parent signals (e.g. useIonViewWillEnter increments resetTrigger)
    useEffect(() => {
        setSliderPosition(0);
    }, [resetTrigger]);
    const sliderRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        const slider = sliderRef.current;
        const handle = handleRef.current;
        if (!slider || !handle) return;

        const rect = slider.getBoundingClientRect();
        const newPos = Math.min(
            Math.max(0, touch.clientX - rect.left - handle.offsetWidth / 2),
            rect.width - handle.offsetWidth
        );
        setSliderPosition(newPos);
    };

    const handleTouchEnd = () => {
        const slider = sliderRef.current;
        if (!slider) return;

        if (sliderPosition > slider.offsetWidth * threshold) {
            setSliderPosition(slider.offsetWidth - 50);
            setTimeout(() => onSlideComplete(), 250);
        } else {
            setSliderPosition(0);
        }
    };

    if (disabled) {
        return (
            <div
                className="slider-button"
                style={{ backgroundColor: "#9ca3af", opacity: 0.7, cursor: "not-allowed" }}
            >
                <div className="slider-handle" style={{ left: "2px", color: "#9ca3af" }}>
                    <IonIcon icon={arrowForward} />
                </div>
                <span className="slider-text">{disabledText ?? text}</span>
            </div>
        );
    }

    return (
        <div
            className="slider-button"
            ref={sliderRef}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ backgroundColor: color }}
        >
            <div
                className="slider-handle"
                ref={handleRef}
                style={{ left: `${sliderPosition + 2}px`, color }}
            >
                <IonIcon icon={arrowForward} />
            </div>
            <span className={`slider-text ${sliderPosition > 60 ? "sliding" : ""}`}>
                {text}
            </span>
        </div>
    );
};

export default SlideToAction;
