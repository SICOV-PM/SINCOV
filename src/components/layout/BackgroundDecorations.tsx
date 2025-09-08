const BackgroundDecorations = () => (
  <div className="absolute inset-0 z-0">
    <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl animate-pulse"></div>
    <div
      className="absolute top-1/4 right-16 w-24 h-24 bg-indigo-200 rounded-full opacity-30 blur-lg animate-pulse"
      style={{ animationDelay: "2s" }}
    ></div>
    <div
      className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-200 rounded-full opacity-15 blur-2xl animate-pulse"
      style={{ animationDelay: "4s" }}
    ></div>
  </div>
);

export default BackgroundDecorations;
