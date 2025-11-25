import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Select from 'react-select'
import { HiOutlineCode } from 'react-icons/hi';
import Editor from '@monaco-editor/react';
import { IoCopy } from 'react-icons/io5';
import { PiExportBold } from 'react-icons/pi';
import { ImNewTab } from 'react-icons/im';
import { GoogleGenAI } from '@google/genai';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { MdClose } from 'react-icons/md';


function Home() {
  const options = [
    { value: 'html-css', label: 'HTML + CSS' },
    { value: 'html-tailwind', label: 'HTML + Tailwind CSS' },
    { value: 'html-bootstrap', label: 'HTML + Bootstrap' },
    { value: 'html-css-js', label: 'HTML + CSS + JS' },
    { value: 'html-tailwind-bootstrap', label: 'HTML + Tailwind + Bootstrap' },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setpromt] = useState("");
  const [framework, setFramework] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);

  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
  const getResponse = async () => {
    setLoading(true);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: ` You are an experienced programmer with expertise in web development and UI/UX design. You create modern, animated, and fully responsive UI components. You are highly skilled in HTML, CSS, Tailwind CSS, Bootstrap, JavaScript, React, Next.js, Vue.js, Angular, and more.

Now, generate a UI component for: ${prompt}  
Framework to use: ${framework.value}  

Requirements:  
The code must be clean, well-structured, and easy to understand.  
Optimize for SEO where applicable.  
Focus on creating a modern, animated, and responsive UI design.  
Include high-quality hover effects, shadows, animations, colors, and typography.  
Return ONLY the code, formatted properly in **Markdown fenced code blocks**.  
Do NOT include explanations, text, comments, or anything else besides the code.  
And give the whole code in a single HTML file.`,
    });
    console.log(response.text);
    setCode(extractCode(response.text));
    setOutputScreen(true);
    setLoading(false);
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code.');
    }
  };

  const downloadFile = () => {
    const fileName = "moment-Component.html";
    const blob = new Blob([code], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded successfully!');
  }
  return (
    <>
      <div>
        <Navbar />
        <div className='flex flex-col lg:flex-row justify-between items-center px-5 sm:px-10 md:px-[50px] lg:px-[100px] gap-[30px]'>
          <div className="left w-full lg:w-[50%] h-auto bg-[#141319] mt-5 p-[20px] py-[30px] rounded-xl">
            <h3 className='text-[22px] sm:text-[25px] font-semibold bg-gradient-to-tl from-slate-800 via-violet-500 to-zinc-400 bg-clip-text text-transparent'>UI Generator</h3>
            <p className='text-gray-400 mt-2 text-[14px] sm:text-[16px]'>Describe your component and AI will code for you</p>
            <p className='text-[15px] font-[700] mt-4 -mb-5 p-2'>Select a FrameWork</p>
            <Select className='mt-5'
              options={options}
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: "#000",
                  borderColor: state.isFocused ? "#555" : "#222",
                  boxShadow: state.isFocused ? "0 0 0 1px #666" : "none",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "2px",
                  "&:hover": { borderColor: "#666" },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  color: "#fff",
                  border: "1px solid #222",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "#111"
                    : state.isSelected
                      ? "#222"
                      : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  "&:active": { backgroundColor: "#222" },
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "#fff",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#aaa",
                }),
                dropdownIndicator: (base, state) => ({
                  ...base,
                  color: state.isFocused ? "#aaa" : "#666",
                  "&:hover": { color: "#aaa" },
                }),
                indicatorSeparator: (base) => ({
                  ...base,
                  backgroundColor: "#333",
                }),
                input: (base) => ({
                  ...base,
                  color: "#fff",
                }),
              }}
              placeholder="Select an option"
              onChange={(e) => { setFramework(e.value) }}
            />
            <p className='text-[15px] font-[700] mt-2 p-2'>Describe your Component</p>
            <textarea onChange={(e) => { setpromt(e.target.value) }} value={prompt} className='w-full min-h-[200px] rounded-xl bg-[#090908] mt-2 p-[10px] text-[14px]' placeholder='Your Prompt Our Code'></textarea>
            <button onClick={getResponse} className="generate flex items-centre p-[15px] rounded-full border-0 cursor-pointer bg-gradient-to-r from-pink-400 via-pink-400 to-pink-500 mt-5 ml-auto min-w-[12px] text-center transition-all hover:opacity-[0.8] w-full sm:w-auto">Generate</button>
          </div>

          <div className="right relative w-full lg:w-[50%] h-[60vh] sm:h-[70vh] lg:h-[80vh] bg-[#141319] mt-5 rounded-xl ">
            {outputScreen === false ?
              <>
                {loading === true ?
                  <>
                    <div className="loader absolute left-0 top-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
                      <ClipLoader className='' />
                    </div>

                  </>
                  : ""}
                <div className="skeleton w-full h-full flex items-center flex-col justify-center px-4 text-center">
                  <div className="circle p-[20px] w-[70px] h-[70px] text-[40px] flex items-center justify-center rounded-[50%] bg-gradient-to-tl from-violet-600 via-violet-500"><HiOutlineCode /></div>
                  <p className='text-[14px] sm:text-[15px] text-gray-400 mt-3'>Your code and component will appear here.</p>
                </div>
              </>
              :
              <>
                <div className="top bg-[#17171C] w-full h-[50px] sm:h-[60px] flex items-center gap-[10px] sm:gap-[15px] px-[10px] sm:px-[20px]">
                  <button onClick={() => { setTab(1) }} className={`code w-1/2 p-[8px] sm:p-[10px] rounded-xl cursor-pointer transition-all ${tab === 1 ? "bg-[#333]" : ""} `}>Code</button>
                  <button onClick={() => { setTab(2) }} className={`preview w-1/2 p-[8px] sm:p-[10px] rounded-xl cursor-pointer transition-all ${tab === 2 ? "bg-[#333]" : ""} `}>Preview</button>
                </div>
                <div className="top-2 bg-[#17171C] w-full h-[50px] sm:h-[60px] flex items-center justify-between gap-[10px] sm:gap-[15px] px-[10px] sm:px-[20px] text-sm sm:text-base">
                  <div className="left">
                    <p className='font-bold'>Code Editor</p>
                  </div>
                  <div className="right flex items-center gap-[8px] sm:gap-[10px]">
                    {tab === 1 ?
                      <>
                        <button className="copy w-[35px] sm:w-[40px] h-[35px] sm:h-[40px] rounded-xl border-[1px] border-zinc-700 flex items-center justify-center transition-all hover:bg-[#333]" onClick={copyCode}><IoCopy /></button>
                        <button className="export w-[35px] sm:w-[40px] h-[35px] sm:h-[40px] rounded-xl border-[1px] border-zinc-700 flex items-center justify-center transition-all hover:bg-[#333]" onClick={downloadFile}><PiExportBold /></button>
                      </>
                      :
                      <>
                        <button className="copy w-[35px] sm:w-[40px] h-[35px] sm:h-[40px] rounded-xl border-[1px] border-zinc-700 flex items-center justify-center transition-all hover:bg-[#333]" onClick={() => { setIsNewTabOpen(true) }} ><ImNewTab /></button>
                       
                      </>
                    }

                  </div>
                </div>
                <div className="editor h-[calc(100%-120px)] sm:h-[calc(100%-140px)]">
                  {
                    tab === 1 ?
                      <Editor
                        height="100%" Language='html' theme='vs-dark' value={code} />
                      :
                      <iframe srcDoc={code} className="preview w-full h-full bg-white text-black flex items-center justify-center"></iframe>
                  }
                </div>
              </>
            }
          </div>
        </div>
      </div>

      {
        isNewTabOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 sm:px-5 h-[55px] sm:h-[60px] bg-white text-black border-b border-gray-500 shadow-md">
              <p className="font-semibold text-base sm:text-lg">Preview</p>
              <button
                onClick={() => setIsNewTabOpen(false)}
                className="p-2 rounded-lg hover:bg-[#bab3b3] transition-all duration-200"
              >
                <MdClose className="text-xl sm:text-2xl" />
              </button>
            </div>

            <div className="flex-1 bg-white overflow-auto">
              <iframe
                srcDoc={code}
                title="Component Preview"
                className="w-full h-full border-none"
              ></iframe>
            </div>
          </div>
        )
      }
    </>
  )
}

export default Home
