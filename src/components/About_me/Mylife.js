import React from "react";
import ScrambleText from "../ScrambleText";

function Mylife({ headline }) {
  const displayHeadline = headline || "Work out to look good naked.";
  return (
    <div className="flex items-center justify-center h-[calc(100vh-54px)] pb-32">
      <div className="flex flex-col items-center text-center px-6" style={{
        fontFamily: 'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace'
      }}>
        <h1 className="text-sm font-normal tracking-widest text-black dark:text-white uppercase">
          <ScrambleText text={displayHeadline} />
        </h1>
      </div>
    </div>
  );
}

export default Mylife;
