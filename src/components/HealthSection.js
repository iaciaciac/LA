import React from 'react';

const HealthSection = () => {
    return (
        <div className="flex items-center justify-center w-full px-6 md:px-16 lg:px-40 2xl:px-48 my-24">
            <div className="w-full max-w-4xl">
                {/* Section Label */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">
                    Health
                </h3>

                {/* Main Headline */}
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-8 leading-tight tracking-tight">
                    Know your body <br className="hidden md:block" /> by heart.
                </h2>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                    <div className="md:col-span-3">
                        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-6">
                            The more insights you have, the more empowered you are to take action. From the ECG app to the Vitals app and more, Apple Watch Series 11 provides a bigger picture of your health, so you can stay informed. And now Series 11 takes the next big step in heart health with a pioneering feature — hypertension notifications.<sup className="text-xs">1</sup>
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <img
                            src="/images/apple_health_lifestyle.png"
                            alt="Apple Watch Health Lifestyle"
                            className="w-full h-auto rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthSection;
