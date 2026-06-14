import React from "react";

function Room() {
  return (
    <div className="w-full h-screen bg-[#0b1324]">
      {/* Logo Part */}
      <div className="text-center">
        <h1 className="font-display text-[32px] font-bold text-[#cbdfe2]">
          HyperCode
        </h1>

        <h2 className="font-body text-[14px] text-[#808e93]">
          Collaborative engineering space
        </h2>
      </div>

      {/* Main Vertical Layout */}
      <div className="flex flex-col items-center w-full">
        
        {/* Left-aligned title container */}
        <div className="flex flex-col items-start w-full max-w-xs pt-20 ">
          <h1 className="font-headline text-[#dae2fb] text-[20px]">
            Join Session
          </h1>
        </div>

        {/* Input module wrapper for the session room parameter */}
        <div className="flex flex-col items-center w-full pt-5">
          <div className="flex flex-col items-start w-full max-w-xs ">
            <h3 className="font-editor text-[#01c8d2] text-[14px]">ROOM ID</h3>

            <input
              placeholder="e.g. hc-alpha-992"
              type="text"
              className="bg-white justify-center text-black px-3 py-2 w-full rounded border border-[#3a494a] focus:outline-none"
            />
          </div>
        </div>


        {/* Input module wrapper for the user alias parameter */}
        <div className="flex flex-col items-center w-full pt-10">
          <div className="flex flex-col items-start w-full max-w-xs ">
            <h3 className="font-editor text-[#01c8d2] text-[14px]">Alias</h3>

            <input
              placeholder="developer_name"
              type="text"
              className="bg-white justify-center text-black px-3 py-2 w-full rounded border border-[#3a494a] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;
