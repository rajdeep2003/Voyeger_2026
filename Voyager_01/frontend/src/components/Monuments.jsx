"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, Headphones, MapPin, ArrowRight } from "lucide-react"
import { Viewer } from "@photo-sphere-viewer/core"
import "@photo-sphere-viewer/core/index.css"

const API_BASE = "https://voyeger2026-backend.onrender.com/api"

export default function Monuments() {
  const [view, setView] = useState("gallery")
  const [monuments, setMonuments] = useState([])
  const [currentMonument, setCurrentMonument] = useState(null)
  const [currentFrame, setCurrentFrame] = useState(null)
  const [currentVibe, setCurrentVibe] = useState("professor")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const audioRef = useRef(null)
  const viewerContainerRef = useRef(null)
  const viewerRef = useRef(null)

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetch(`${API_BASE}/monuments/getAll`)
      .then(res => res.json())
      .then(setMonuments)
      .finally(() => setLoading(false))
  }, [])

  /* ---------------- NAVIGATION ---------------- */

  const startTour = async (id) => {
    const res = await fetch(`${API_BASE}/monuments/getById/${id}`)
    const data = await res.json()
    setCurrentMonument(data)
    setCurrentFrame(null)
    setView("overview")
    window.scrollTo(0, 0)
  }

  const loadEntryFrame = async () => {
    const res = await fetch(
      `${API_BASE}/frames/getEntryFrameByMonumentId/${currentMonument._id}`
    )
    const frame = await res.json()
    setCurrentFrame(frame)
    setView("tour")
    window.scrollTo(0, 0)
  }

  const navigateToFrame = async (frameId) => {
    const res = await fetch(`${API_BASE}/frames/getById/${frameId}`)
    const frame = await res.json()
    setCurrentFrame(frame)
    window.scrollTo(0, 0)
  }

  const showGallery = () => {
    setView("gallery")
    setCurrentMonument(null)
    setCurrentFrame(null)
  }

  /* ---------------- CONTENT ---------------- */

  const content = (() => {
    if (view === "tour" && currentFrame) {
      return {
        title: currentFrame.title,
        image: currentFrame.imageUrl,
        text: currentFrame.narration[currentVibe],
        audio: currentFrame.narrationAudioUrl[currentVibe]
      }
    }
    return {
      title: currentMonument?.name,
      image: currentMonument?.imgUrl,
      text: currentMonument?.overview?.[currentVibe],
      audio: currentMonument?.overviewAudioUrl?.[currentVibe]
    }
  })()

  /* ---------------- 360 VIEW (RECREATE EVERY IMAGE) ---------------- */

  useEffect(() => {
    if (!viewerContainerRef.current || !content?.image) return

    // destroy previous viewer (CRITICAL FIX)
    if (viewerRef.current) {
      viewerRef.current.destroy()
      viewerRef.current = null
    }

    viewerRef.current = new Viewer({
      container: viewerContainerRef.current,
      panorama: content.image,
      defaultZoomLvl: 40,
      mousewheelCtrlKey: false,
      touchmoveTwoFingers: true,
      navbar: ["zoom", "fullscreen"],
      loadingTxt: "Loading view...",
      panoData: {
        fullWidth: 4000,
        fullHeight: 2000,
        croppedWidth: 4000,
        croppedHeight: 2000,
        croppedX: 0,
        croppedY: 0
      }
    })

    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [content?.image])

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <h1
            onClick={showGallery}
            className="text-2xl font-black text-cyan-500 cursor-pointer"
          >
            VOYAGER.
          </h1>

          {view === "gallery" && (
            <input
              placeholder="Search destinations..."
              className="bg-slate-800 px-6 py-2 rounded-full"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === "gallery" ? (
          <section>
            <h2 className="text-3xl font-bold mb-10">Explore the World</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {monuments
                .filter(m =>
                  m.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(m => (
                  <div
                    key={m._id}
                    onClick={() => startTour(m._id)}
                    className="cursor-pointer bg-slate-900 rounded-2xl overflow-hidden"
                  >
                    <img
                      src={m.imgUrl}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-xl font-bold">{m.name}</h3>
                      <p className="flex gap-1 text-sm text-slate-400 mt-2">
                        <MapPin size={14} /> {m.location?.address}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ) : (
          <section>
            <button onClick={showGallery} className="flex gap-2 mb-8 text-slate-400">
              <ChevronLeft /> Back to Gallery
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* IMAGE */}
              <div className="lg:col-span-3 space-y-6">
                <div
                  ref={viewerContainerRef}
                  className="w-full aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-black"
                />

                <div className="bg-slate-900 p-4 rounded-2xl flex gap-4">
                  <Headphones className="text-cyan-500" />
                  <audio
                    ref={audioRef}
                    key={content.audio}
                    src={content.audio}
                    controls
                    autoPlay
                    className="flex-1"
                  />
                </div>
              </div>

              {/* TEXT */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex justify-between">
                  <h2 className="text-4xl font-black">{content.title}</h2>
                  <select
                    value={currentVibe}
                    onChange={(e) => setCurrentVibe(e.target.value)}
                    className="bg-slate-800 px-3 py-2 rounded text-cyan-400"
                  >
                    <option value="professor">🎓 Professor</option>
                    <option value="local">🏠 Local</option>
                    <option value="fun">🎉 Fun</option>
                    <option value="cynical">💀 Cynical</option>
                  </select>
                </div>

                <p className="italic border-l-4 border-cyan-500/30 pl-6">
                  {content.text}
                </p>

                <div className="pt-8 border-t border-slate-800">
                  {view === "overview" ? (
                    <button
                      onClick={loadEntryFrame}
                      className="w-full bg-cyan-600 py-4 rounded-xl font-bold"
                    >
                      Begin Visual Tour
                    </button>
                  ) : currentFrame?.pathsForward?.length > 0 ? (
                    currentFrame.pathsForward.map(p => (
                      <button
                        key={p.nextFrameId}
                        onClick={() => navigateToFrame(p.nextFrameId)}
                        className="w-full bg-slate-800 py-4 rounded-xl mt-3"
                      >
                        {p.nextFrameLabel || "Move Forward"}{" "}
                        <ArrowRight className="inline ml-2 text-cyan-500" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center p-8 bg-slate-900/50 rounded-2xl border border-dashed">
                      <p className="text-cyan-500 font-bold mb-4">
                        Tour Complete
                      </p>
                      <button
                        onClick={showGallery}
                        className="px-6 py-2 bg-slate-800 rounded-lg"
                      >
                        Return Home
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
