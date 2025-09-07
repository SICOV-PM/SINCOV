import './App.css'

function App() {

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="p-6 rounded-2xl shadow-lg bg-white text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          🚀 React + Tailwind + Vite
        </h1>
        <button className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition">
          Click me
        </button>
      </div>
    </div>
  )
}

export default App
