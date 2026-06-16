import React from 'react'

function Editor() {
  return (
    <div className='bg-[#0b1324] text-[#dae2fb] h-screen overflow-hidden flex flex-col font-sans antialiased'>
      
      <header className='bg-[#0b1324 text-[#e9feff] border-b border[#3a494a] flex justify-between items-center h-[32px] px-[24px] w-full shrink-0 z-50'>
      <div className='flex items-center gap-[16px]'>
        <span className='text-[20px] font-bold'>HyperCode</span>
       <div className="h-4 w-px bg-[#3a494a] mx-[16px]"></div>
       
        <div className='flex items-center gap-[8px] text-[#b9caca] text-[11px] font-mono tracking-wider'>
          <span>Room ID: #ALPHA-9</span>
          <input type="button" value={"Content Copy"} className="hover:text-[#e9feff] transition-colors hover:bg-[#2d3547] rounded-full p-1 opacity-80 scale-95 material-symbols-outlined text-[14px]"/>
        </div>
      </div>

      <div className='flex items-center gap-[8px]'>
        <div className='flex -space-x-2 mr-[24px]'>
          <img alt="Sarah" className="w-6 h-6 rounded-full border border-[#171f31] ring-1 ring-[#63f7ff]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASLGMd8xlSU7zU2CFz0TeWhE2scSu2l6xA_kTXYjqbU9B7d5cfAsvF5bf5NUjYJJSZVeo4CfytMtOxGMxFOs6wSl1bgfDDOcEkE1MSDzFRJRa1_qrNZwDZxdnLTz-neLUeSIhjR7Z8JsH7gELBw8BfPCMEI26JSGgO1JYc49BIf1YO68RowLUKZ3qLhuT_EDDCFf4HF28xVPjVoeWMso9DUNykjpvLkvDAUVWFKsEozS_sKAzDSCMc7JtYYo7EMNqrOFNGWfQFHXwB" />          <img alt="Sarah" />
          <img alt="Alex" className="w-6 h-6 rounded-full border border-[#171f31] ring-1 ring-[#fbb3c1]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe93YJtag3PB2vpP5j0NQAzlQRy6N3Eudpav-cKDjIew3P6_mAomCqvcKo8OU3ICz9hlAux_tRurbTxnykJH132n9lXj6PkveOMQFn52Z4B_ukdGln6SuRgcWdQJOZsuYf5ImJRM5rPTb5bF7v-qRtdMmToPPbLKFoQ_4edu3pXtksciQXUhlC14pqMl9ZMhepivumWMeXv0DzbcO8A_zDqCyXQFq64YIhRdRA4W5uavf4pl7ZaNVNz5E5ugMDeyLb4WybNRAoyQjb" />
        </div>

        <button className="hover:bg-[#2d3547] transition-colors text-[#b9caca] rounded-full p-1 opacity-80 scale-95">
            <span className="material-symbols-outlined text-[16px]">dark_mode</span>
        </button>
      </div>

    </header>
     
     <div className='flex flex-1 overflow-hidden'>
        <nav className='bg-[#171f31] w-[240px] flex flex-col border-r border-[#3a494a] shrink-0 hidden md:flex'>
          <div className='p-[24px] border-b border-[#3a494a]' >
            <div className='flex items-center gap-[16px]'>
              <div className='W-8 H-8 rounded-full bg-[#2d3547] border border-[#3a494a] flex items-center justify-center text-[#63f7ff]'>
                <span className="material-symbols-outlined text-[18px]">
                  deployed code
                </span>
              </div>
              <div>
                <h2 className="text-[11px] font-bold tracking-wider uppercase">Project Alpha</h2>
                <span className="text-[11px] text-[#b9caca] block mt-[2px]">main branch</span>
              </div>
            </div>
          </div>

          <div>
           
          </div>
        </nav>
      </div>

    </div>
  )
}

export default Editor