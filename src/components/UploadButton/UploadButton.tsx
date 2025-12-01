import React from "react";
import "./UploadButton.css";

interface UploadButtonProps {
    label: string;
    file: File | null;
    onSelect: (file: File | null) => void;
    id: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({ label, file, onSelect, id }) => {
    return (
        <div className="upload-button-wrapper">
            <label className="upload-label">{label}</label>

            <div
                className="upload-box"
                onClick={() => document.getElementById(id)?.click()}
            >
                <span className="upload-icon">📄</span>

                <div className="upload-text">
                    <strong>{file ? file.name : `Upload ${label}`}</strong>
                </div>
            </div>

            <input
                id={id}
                type="file"
                className="hidden-file-input"
                accept="image/*,application/pdf"
                onChange={(e) => onSelect(e.target.files?.[0] || null)}
            />
        </div>
    );
};

export default UploadButton;
