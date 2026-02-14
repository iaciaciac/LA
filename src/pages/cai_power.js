import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import HeroText from '../components/HeroText';
import PhotoEditor from '../components/PhotoEditor';

export default function CaiPower() {
    const [localImage, setLocalImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleLocalUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check for HEIC
            if (file.name.toLowerCase().endsWith('.heic')) {
                alert('Currently the editor does not support native HEIC. Please convert it to JPG first, or use the "cai_photos" gallery to upload HEIC.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setLocalImage({
                    _id: 'local-' + Date.now(),
                    title: file.name,
                    url: event.target.result,
                    isLocal: true
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-x-hidden">
            <Navbar />

            {/* Premium Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full opacity-50"></div>
            </div>

            {/* Main Content Area: Workbench Mode - Optimized for Top-to-Bottom Flow */}
            <div className="relative z-10 w-full px-4 md:px-8 pt-20 pb-8">
                <div className="w-full max-w-[1600px] mx-auto h-[85vh]">
                    <PhotoEditor
                        photo={localImage}
                        onPhotoSelect={setLocalImage}
                    />
                </div>
            </div>
        </div>
    );
}
