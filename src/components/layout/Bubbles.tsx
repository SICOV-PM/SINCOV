const Bubbles = ({ count = 60 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const size = 8 + Math.random() * 120;
        return (
          <span
            key={i}
            className="bubble absolute bg-blue-300 rounded-full opacity-20 blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${size}px`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${18 + Math.random() * 6}s`,
              animationDelay: `${(i * 0.5) % 20}s`,
            }}
          />
        );
      })}
    </>
  );
};

export default Bubbles;
