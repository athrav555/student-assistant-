import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, BookOpen, Layers, CheckCircle2, XCircle, ChevronRight, Loader2, RefreshCw } from 'lucide-react';

const NotesTab = ({ notes }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {notes?.map((section, idx) => (
      <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
          {typeof section.topic === 'object' ? JSON.stringify(section.topic) : section.topic}
        </h3>
        <ul className="space-y-3">
          {section.points?.map((point, pIdx) => (
            <li key={pIdx} className="flex items-start text-slate-700">
              <ChevronRight className="w-5 h-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
              <span>{typeof point === 'object' ? JSON.stringify(point) : point}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const Flashcard = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full h-64 cursor-pointer relative"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="w-full h-full relative transition-transform duration-500 rounded-xl shadow-md border border-slate-200"
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
        }}
      >
        {/* Front */}
        <div 
          className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-white rounded-xl text-center"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2 block">Front (Tap to flip)</span>
              <p className="text-lg font-semibold text-slate-800">{typeof card.front === 'object' ? JSON.stringify(card.front) : card.front}</p>
          </div>
        </div>
        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-indigo-50 rounded-xl text-center shadow-inner"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2 block">Back</span>
              <p className="text-lg text-slate-800">{typeof card.back === 'object' ? JSON.stringify(card.back) : card.back}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlashcardsTab = ({ flashcards }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {flashcards?.map((card, idx) => (
      <Flashcard key={idx} card={card} />
    ))}
  </div>
);

const QuizTab = ({ quiz }) => {
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIdx, option) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const submitQuiz = () => {
    let currentScore = 0;
    quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) currentScore++;
    });
    setScore(currentScore);
    setIsSubmitted(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {quiz?.map((q, idx) => {
        const isCorrect = isSubmitted && answers[idx] === q.correctAnswer;
        const isWrong = isSubmitted && answers[idx] !== q.correctAnswer;

        return (
          <div key={idx} className={`bg-white rounded-xl shadow-sm border p-6 ${isSubmitted ? (isCorrect ? 'border-green-300' : 'border-red-300') : 'border-slate-200'}`}>
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex">
              <span className="text-indigo-500 mr-2">{idx + 1}.</span>
              {typeof q.question === 'object' ? JSON.stringify(q.question) : q.question}
            </h4>
            <div className="space-y-3">
              {q.options?.map((opt, oIdx) => {
                const isSelected = answers[idx] === opt;
                let optionClass = "flex items-center w-full p-4 rounded-lg border transition-all duration-200 text-left ";
                
                if (!isSubmitted) {
                  optionClass += isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                } else {
                  if (opt === q.correctAnswer) {
                    optionClass += "border-green-500 bg-green-50";
                  } else if (isSelected && opt !== q.correctAnswer) {
                    optionClass += "border-red-500 bg-red-50";
                  } else {
                    optionClass += "border-slate-200 opacity-50";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(idx, opt)}
                    disabled={isSubmitted}
                    className={optionClass}
                  >
                    <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-500' : 'border-slate-300'}`}>
                      {isSelected && <div className={`w-3 h-3 rounded-full ${isSubmitted ? (opt === q.correctAnswer ? 'bg-green-500' : 'bg-red-500') : 'bg-indigo-500'}`} />}
                    </div>
                    <span className="text-slate-700">{typeof opt === 'object' ? JSON.stringify(opt) : opt}</span>
                    
                    {isSubmitted && opt === q.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                    {isSubmitted && isSelected && opt !== q.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="sticky bottom-4 p-6 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between z-10">
        <div className="mb-4 sm:mb-0">
          {isSubmitted ? (
            <div className="text-xl font-bold">
              Your Score: <span className={score === quiz?.length ? 'text-green-600' : 'text-indigo-600'}>{score} / {quiz?.length}</span>
            </div>
          ) : (
            <div className="text-slate-500 font-medium">
              Answered: {Object.keys(answers).length} / {quiz?.length || 0}
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          {isSubmitted ? (
             <button onClick={resetQuiz} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center">
               <RefreshCw className="w-4 h-4 mr-2" /> Try Again
             </button>
          ) : (
            <button 
              onClick={submitQuiz}
              disabled={!quiz || Object.keys(answers).length < quiz.length}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [pdfReady, setPdfReady] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [studyData, setStudyData] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // Load PDF.js dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setPdfReady(true);
    };
    script.onerror = () => {
      setError("Failed to load PDF processing library. Please check your internet connection.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid PDF file.");
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please drop a valid PDF file.");
    }
  };

  const extractTextFromPDF = async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      // Limit to first 20 pages to avoid hitting token limits for very large books
      const maxPages = Math.min(pdf.numPages, 20); 
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    } catch (err) {
      console.error("PDF extraction error:", err);
      throw new Error("Failed to extract text from the PDF. It might be corrupted or protected.");
    }
  };

  const generateMaterials = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setStudyData(null);

    try {
      setLoadingMsg("Extracting text from PDF...");
      const text = await extractTextFromPDF(file);

      if (!text || text.trim().length < 50) {
        throw new Error("Not enough text found in the PDF. Please upload a document with readable text.");
      }

      setLoadingMsg("Analyzing content with AI...");
      
      const prompt = `Analyze the following academic text and generate study materials. Create comprehensive structured notes, a set of 8-12 interactive flashcards focusing on key definitions and concepts, and a 5-question multiple choice quiz to test comprehension.\n\nSource Text:\n${text.substring(0, 50000)}`; // limit chars just in case

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              notes: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    topic: { type: "STRING" },
                    points: { type: "ARRAY", items: { type: "STRING" } }
                  }
                }
              },
              flashcards: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    front: { type: "STRING" },
                    back: { type: "STRING" }
                  }
                }
              },
              quiz: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    correctAnswer: { type: "STRING", description: "Must exactly match one of the items in the options array" }
                  }
                }
              }
            },
            required: ["notes", "flashcards", "quiz"]
          }
        }
      };

      setLoadingMsg("Generating Notes, Flashcards, and Quiz...");
      
      const apiKey = ""; // API key populated by the environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      // Implement a simple retry logic
      let response;
      let retries = 2;
      while (retries > 0) {
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) break;
        } catch(e) {}
        retries--;
        await new Promise(r => setTimeout(r, 1500)); // wait 1.5s
      }

      if (!response || !response.ok) {
        throw new Error("Failed to communicate with AI server.");
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(jsonText);
        
        setStudyData({
          notes: Array.isArray(parsedData.notes) ? parsedData.notes : [],
          flashcards: Array.isArray(parsedData.flashcards) ? parsedData.flashcards : [],
          quiz: Array.isArray(parsedData.quiz) ? parsedData.quiz : []
        });
      } else {
        throw new Error("AI returned an empty or invalid response.");
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
      setLoadingMsg("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl font-extrabold tracking-tight">EduQuest<span className="text-slate-800">AI</span></h1>
          </div>
          {studyData && (
            <button 
              onClick={() => { setStudyData(null); setFile(null); }}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 px-3 py-1.5 rounded-md"
            >
              Upload New Document
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Upload State */}
        {!studyData && (
          <div className="max-w-2xl mx-auto mt-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Turn your PDFs into Study Powerhouses</h2>
              <p className="text-lg text-slate-600">Upload a lecture, chapter, or article. Our AI extracts the text and creates Notes, Flashcards, and Quizzes instantly.</p>
            </div>

            <div 
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${isProcessing ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50 bg-white'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Analyzing Document</h3>
                  <p className="text-indigo-600 animate-pulse">{loadingMsg}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <UploadCloud className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Drag & Drop your PDF here</h3>
                  <p className="text-slate-500 mb-6">or click to browse from your computer</p>
                  
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  
                  <div className="flex flex-col gap-4 w-full sm:w-auto">
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      disabled={!pdfReady}
                      className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-colors"
                    >
                      {pdfReady ? 'Select PDF File' : 'Loading Engine...'}
                    </button>

                    {file && (
                      <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg text-left">
                        <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    )}

                    {file && (
                      <button 
                        onClick={generateMaterials}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center"
                      >
                        Generate Study Materials <ChevronRight className="w-5 h-5 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center flex items-center justify-center">
                <XCircle className="w-5 h-5 mr-2 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Results State */}
        {studyData && (
          <div className="animate-in fade-in duration-700">
            {/* Tabs Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'notes' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <FileText className="w-4 h-4 mr-2" /> Structured Notes
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`flex items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'flashcards' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Layers className="w-4 h-4 mr-2" /> Flashcards
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'quiz' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Practice Quiz
                </button>
              </div>
            </div>

            {/* Tab Content Areas */}
            <div className="pb-20">
              {activeTab === 'notes' && <NotesTab notes={studyData.notes} />}
              {activeTab === 'flashcards' && <FlashcardsTab flashcards={studyData.flashcards} />}
              {activeTab === 'quiz' && <QuizTab quiz={studyData.quiz} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}