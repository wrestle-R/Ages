import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const BirthdayCake = ({ person, onClose }) => {
  const [litCandles, setLitCandles] = useState([]);
  const [candlePositions, setCandlePositions] = useState([]);
  const age = Math.floor(person.currentAge);

  useEffect(() => {
    // Calculate candle positions
    const positions = [];
    let candleHalfCount = 1;
    const candleCount = Math.min(age, 30); // Max 30 candles

    for (let i = 0; i < candleCount; i++) {
      if (i + 1 < candleCount / 2) candleHalfCount++;
      else if (i + 1 > candleCount / 2) candleHalfCount--;

      const candleXPositionOffset = candleHalfCount * (20 / (candleCount / 2));
      const candleXPosition = -310 + 600 / candleCount / 2 + (600 / candleCount) * i;
      const candleYPosition =
        -1 *
        Math.floor(
          Math.random() * (325 + candleXPositionOffset - (320 - candleXPositionOffset) + 1) +
            (320 - candleXPositionOffset)
        );

      positions.push({
        id: i,
        x: candleXPosition,
        y: candleYPosition,
      });
    }

    setCandlePositions(positions);
    setLitCandles(Array(candleCount).fill(true));
  }, [age]);

  const putOutCandle = (index, e) => {
    if (e) {
      e.stopPropagation();
    }
    const newLitCandles = [...litCandles];
    newLitCandles[index] = false;
    setLitCandles(newLitCandles);
  };

  const putOutAllCandles = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setLitCandles(Array(litCandles.length).fill(false));
  };

  const relightCandles = () => {
    setLitCandles(Array(litCandles.length).fill(true));
  };

  const allCandlesOut = litCandles.every((candle) => !candle);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: "linear-gradient(to bottom, #F08080 0%, #E9967A 50%, #FF7F50 100%)",
        }}
      >
        {/* Confetti effect when all candles are out */}
        {allCandlesOut && litCandles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: typeof window !== "undefined" ? Math.random() * window.innerWidth : 500,
                  y: -20,
                  rotate: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
                  rotate: Math.random() * 1080 - 540,
                  opacity: [1, 1, 0.8, 0],
                  scale: [1, 1.2, 0.8, 0.5],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 0.8,
                  ease: "easeOut",
                }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  background: [
                    "#FF6B6B",
                    "#4ECDC4",
                    "#45B7D1",
                    "#FFA07A",
                    "#98D8C8",
                    "#F7DC6F",
                    "#BB8FCE",
                    "#85C1E2",
                    "#F8B88B",
                    "#FAD7A1",
                  ][Math.floor(Math.random() * 10)],
                }}
              />
            ))}
          </div>
        )}

        {/* Close button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-white text-xl md:text-2xl font-bold bg-white/10 backdrop-blur-sm rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-white/20 hover:border-white/40 transition-all shadow-lg z-10"
        >
          <FaTimes />
        </motion.button>

        {/* Relight button */}
        {allCandlesOut && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={relightCandles}
            className="absolute top-4 left-4 md:top-6 md:left-6 text-white text-sm md:text-base font-bold bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 md:px-6 md:py-3 flex items-center gap-2 border-2 border-white/20 hover:border-white/40 transition-all shadow-lg z-10"
            style={{ fontFamily: "'Leckerli One', cursive" }}
          >
            🕯️ Relight Candles
          </motion.button>
        )}

        {/* Cake container - responsive sizing */}
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative"
          style={{
            width: "min(600px, 90vw)",
            height: "min(500px, 70vh)",
            transform: "scale(1)",
          }}
        >
          {/* Candles */}
          {candlePositions.map((candle, index) => (
            <motion.div
              key={candle.id}
              initial={{ scale: 0, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: index * 0.03, type: "spring" }}
              className="candle-component"
              style={{
                position: "absolute",
                width: "18px",
                height: "100px",
                top: "50%",
                left: "50%",
                marginLeft: `${candle.x}px`,
                marginTop: `${candle.y}px`,
                background: "#ffffff",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                zIndex: 5,
                cursor: "pointer",
              }}
              onClick={(e) => putOutCandle(index, e)}
            >
              {/* Candle stripes */}
              <div
                style={{
                  background: "rgba(255, 0, 0, 0.4)",
                  position: "absolute",
                  width: "100%",
                  height: "3px",
                  borderRadius: "100%",
                  transform: "skewY(-50deg)",
                  top: "25%",
                  left: 0,
                }}
              />
              <div
                style={{
                  background: "rgba(255, 0, 0, 0.4)",
                  position: "absolute",
                  width: "100%",
                  height: "3px",
                  borderRadius: "100%",
                  transform: "skewY(-50deg)",
                  top: "50%",
                  left: 0,
                }}
              />

              {/* Flame */}
              {litCandles[index] && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  style={{
                    position: "relative",
                    top: 0,
                    left: "50%",
                    marginLeft: "-3.5px",
                  }}
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flame-component"
                      style={{
                        borderRadius: "100%",
                        position: "relative",
                        width: "7px",
                        height: "18px",
                        top: 0,
                        left: "50%",
                        marginLeft: "-3.2px",
                        marginTop: "-18px",
                        animation: `flame ${[2, 1.5, 1, 0.5, 0.25][i]}s 0s infinite`,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Cake */}
          <motion.div
            className="cake-component"
            style={{
              position: "absolute",
              width: "100%",
              height: "500px",
              top: "50%",
              left: "50%",
              marginTop: "-250px",
              marginLeft: "-50%",
              cursor: "pointer",
            }}
            onClick={putOutAllCandles}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="cake-inner" style={{ position: "relative" }}>
              {/* Icing */}
              <div
                className="icing"
                style={{
                  display: "block",
                  width: "100%",
                  borderBottomLeftRadius: "50%",
                  borderBottomRightRadius: "50%",
                  border: "solid 1px #000000",
                  borderTopLeftRadius: "25%",
                  borderTopRightRadius: "25%",
                  marginTop: "0px",
                  height: "100px",
                  background: "#f0e4d0",
                  zIndex: 4,
                  position: "relative",
                }}
              >
                {/* Drips */}
                <div
                  className="drip"
                  style={{
                    borderBottomLeftRadius: "50%",
                    borderBottomRightRadius: "50%",
                    backgroundColor: "#f0e4d0",
                    borderBottom: "solid 1px #000000",
                    zIndex: 5,
                    position: "relative",
                    width: "40px",
                    height: "50px",
                    marginTop: "35px",
                    marginLeft: "-1px",
                    borderLeft: "solid 1px #000000",
                    borderRight: "solid 1px #000000",
                    transform: "skewY(20deg)",
                  }}
                />
                <div
                  className="drip"
                  style={{
                    borderBottomLeftRadius: "50%",
                    borderBottomRightRadius: "50%",
                    backgroundColor: "#f0e4d0",
                    borderBottom: "solid 1px #000000",
                    zIndex: 5,
                    position: "relative",
                    width: "175px",
                    height: "100px",
                    marginTop: "-60px",
                    marginLeft: "40px",
                  }}
                />
                <div
                  className="drip"
                  style={{
                    borderBottomLeftRadius: "50%",
                    borderBottomRightRadius: "50%",
                    backgroundColor: "#f0e4d0",
                    borderBottom: "solid 1px #000000",
                    zIndex: 5,
                    position: "relative",
                    width: "200px",
                    height: "100px",
                    marginTop: "-60px",
                    marginLeft: "200px",
                  }}
                />
                <div
                  className="drip"
                  style={{
                    borderBottomLeftRadius: "50%",
                    borderBottomRightRadius: "50%",
                    backgroundColor: "#f0e4d0",
                    borderBottom: "solid 1px #000000",
                    zIndex: 5,
                    position: "relative",
                    width: "175px",
                    height: "100px",
                    marginTop: "-130px",
                    marginLeft: "395px",
                  }}
                />
                <div
                  className="drip"
                  style={{
                    borderBottomLeftRadius: "50%",
                    borderBottomRightRadius: "50%",
                    backgroundColor: "#f0e4d0",
                    borderBottom: "solid 1px #000000",
                    zIndex: 5,
                    position: "relative",
                    width: "40px",
                    height: "50px",
                    marginTop: "-90px",
                    marginLeft: "559px",
                    borderLeft: "solid 1px #000000",
                    borderRight: "solid 1px #000000",
                    transform: "skewY(-20deg)",
                  }}
                />
              </div>

              {/* Cake Layers */}
              <div
                className="layer top"
                style={{
                  display: "block",
                  width: "100%",
                  borderBottomLeftRadius: "50%",
                  borderBottomRightRadius: "50%",
                  border: "solid 1px #000000",
                  borderTopLeftRadius: "25%",
                  borderTopRightRadius: "25%",
                  marginTop: "-100px",
                  height: "200px",
                  background: "#553c13",
                  zIndex: 3,
                  position: "relative",
                }}
              />
              <div
                className="layer middle"
                style={{
                  display: "block",
                  width: "100%",
                  borderBottomLeftRadius: "50%",
                  borderBottomRightRadius: "50%",
                  border: "solid 1px #000000",
                  marginTop: "-100px",
                  height: "200px",
                  background: "#553c13",
                  zIndex: 2,
                  position: "relative",
                }}
              />
              <div
                className="layer bottom"
                style={{
                  display: "block",
                  width: "100%",
                  borderBottomLeftRadius: "50%",
                  borderBottomRightRadius: "50%",
                  border: "solid 1px #000000",
                  marginTop: "-100px",
                  height: "200px",
                  background: "#553c13",
                  zIndex: 1,
                  position: "relative",
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Message - responsive positioning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute text-center"
          style={{
            width: "min(600px, 90vw)",
            top: "auto",
            bottom: "5vh",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Leckerli One', cursive",
            fontSize: "clamp(24px, 5vw, 40px)",
            color: "#f0e4d0",
          }}
        >
          <div>Happy Birthday {person.name}!</div>
          <div style={{ fontSize: "clamp(18px, 3vw, 24px)", marginTop: "10px" }}>
            {age} {age === 1 ? "year" : "years"} old! 🎉
          </div>
          <div
            style={{
              fontSize: "clamp(12px, 2.5vw, 18px)",
              marginTop: "10px",
              opacity: 0.8,
            }}
          >
            Click candles to blow them out individually
            <br />
            Click cake to blow them all out at once
          </div>
        </motion.div>

        {/* Flame animation styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Leckerli+One&display=swap');

          @keyframes flame {
            0%, 100% {
              background: rgba(254, 248, 97, 0.5);
              box-shadow: 0 0 40px 10px rgba(248, 233, 209, 0.2);
              transform: translateY(0) scale(1);
            }
            50% {
              background: rgba(255, 50, 0, 0.1);
              box-shadow: 0 0 40px 20px rgba(248, 233, 209, 0.2);
              transform: translateY(-20px) scale(0);
            }
          }

          .flame-component {
            animation: flame 2s infinite;
          }

          @media (max-width: 768px) {
            .cake-component {
              transform: scale(0.7);
            }
          }

          @media (max-width: 480px) {
            .cake-component {
              transform: scale(0.5);
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default BirthdayCake;
