import React, { useEffect, useState } from "react";
  import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const BirthdayCake = ({ candles = 9, name = null, messages = [], onClose }) => {
  const [candleStates, setCandleStates] = useState([]);

  // Disable scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const candleArray = [];
    let candleHalfCount = 1;

    for (let i = 0; i < candles; i++) {
      if ((i + 1) < (candles / 2)) candleHalfCount++;
      else if ((i + 1) > (candles / 2)) candleHalfCount--;

      const candleXPositionOffset = candleHalfCount * (20 / (candles / 2));
      const candleXPosition = ((-310 + (600 / candles) / 2) + ((600 / candles) * i));
      const candleYPosition = -1 * Math.floor(Math.random() * ((325 + candleXPositionOffset) - (320 - candleXPositionOffset) + 1) + (320 - candleXPositionOffset));

      candleArray.push({
        id: i,
        x: candleXPosition,
        y: candleYPosition,
        lit: true
      });
    }

    setCandleStates(candleArray);
  }, [candles]);

  const putOutCandle = (id, e) => {
    if (e) {
      e.stopPropagation();
    }
    setCandleStates(prev =>
      prev.map(candle =>
        candle.id === id ? { ...candle, lit: false } : candle
      )
    );
  };

  const putOutAllCandles = () => {
    setCandleStates(prev =>
      prev.map(candle => ({ ...candle, lit: false }))
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-3xl bg-black/20"
        onClick={onClose}
        style={{ cursor: 'pointer' }}
      >
        {/* Additional blur overlay for stronger effect */}
        <div className="absolute inset-0 backdrop-blur-xl bg-black/10" style={{ pointerEvents: 'none' }} />
        <style>{`
          @import url("https://fonts.googleapis.com/css2?family=Leckerli+One&display=swap");

          .birthday-cake-modal {
            background: linear-gradient(to bottom, #F08080 0%, #E9967A 50%, #FF7F50 100%);
          }

          .cake-container {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .cake {
            position: absolute;
            width: 600px;
            height: 500px;
            top: 50%;
            left: 50%;
            margin-top: -250px;
            margin-left: -300px;
          }

          .cake > * {
            position: relative;
          }

          .layer,
          .icing {
            display: block;
            width: 100%;
            border-bottom-left-radius: 50%;
            border-bottom-right-radius: 50%;
            border: solid 1px #000000;
          }

          .layer {
            margin-top: -100px;
            height: 200px;
            background: #553c13;
            z-index: 0;
          }

          .bottom {
            z-index: 1;
          }

          .middle {
            z-index: 2;
          }

          .top {
            z-index: 3;
          }

          .top,
          .icing {
            border-top-left-radius: 25%;
            border-top-right-radius: 25%;
          }

          .icing {
            margin-top: 0px;
            height: 100px;
            background: #f0e4d0;
            z-index: 4;
          }

          .drip {
            border-bottom-left-radius: 50%;
            border-bottom-right-radius: 50%;
            background-color: #f0e4d0;
            border-bottom: solid 1px #000000;
            z-index: 5;
          }

          .drip:nth-child(1) {
            width: 40px;
            height: 50px;
            margin-top: 35px;
            margin-left: -1px;
            border-left: solid 1px #000000;
            border-right: solid 1px #000000;
            transform: skewY(20deg);
          }

          .drip:nth-child(2) {
            width: 175px;
            height: 100px;
            margin-top: -60px;
            margin-left: 40px;
          }

          .drip:nth-child(3) {
            width: 200px;
            height: 100px;
            margin-top: -60px;
            margin-left: 200px;
          }

          .drip:nth-child(4) {
            width: 175px;
            height: 100px;
            margin-top: -130px;
            margin-left: 395px;
          }

          .drip:nth-child(5) {
            width: 40px;
            height: 50px;
            margin-top: -90px;
            margin-left: 559px;
            border-left: solid 1px #000000;
            border-right: solid 1px #000000;
            transform: skewY(-20deg);
          }

          .candle {
            position: absolute;
            width: 18px;
            height: 100px;
            top: 50%;
            left: 50%;
            background: #ffffff;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            z-index: 5;
            cursor: pointer;
          }

          .candle:after,
          .candle:before {
            background: rgba(255, 0, 0, 0.4);
            content: "";
            position: absolute;
            width: 100%;
            height: 3px;
            border-radius: 100%;
            transform: skewY(-50deg);
          }

          .candle:after {
            top: 25%;
            left: 0;
          }

          .candle:before {
            top: 50%;
            left: 0;
          }

          .flame {
            border-radius: 100%;
            position: relative;
            width: 7px;
            height: 18px;
            top: 0px;
            left: 50%;
            margin-left: -3.5px;
            margin-top: -18px;
          }

          .flame:nth-child(1) {
            animation: flame 2s 0s infinite;
          }
          .flame:nth-child(2) {
            animation: flame 1.5s 0s infinite;
          }
          .flame:nth-child(3) {
            animation: flame 1s 0s infinite;
          }
          .flame:nth-child(4) {
            animation: flame 0.5s 0s infinite;
          }
          .flame:nth-child(5) {
            animation: flame 0.25s 0s infinite;
          }

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

          .message {
            position: absolute;
            width: 600px;
            top: 50%;
            left: 50%;
            margin-top: 250px;
            margin-left: -300px;
            text-align: center;
            font-family: "Leckerli One", cursive;
            font-size: 40px;
            color: #f0e4d0;
          }

          @media (min-width: 1024px) {
            .cake {
              transform: scale(1.1);
            }
            .message {
              font-size: 48px;
            }
          }

          @media (max-width: 768px) {
            .cake {
              transform: scale(0.75);
            }
            .message {
              width: 90vw;
              margin-left: -45vw;
              font-size: 32px;
            }
            .candle {
              transform: scale(0.75);
            }
          }

          @media (max-width: 480px) {
            .cake {
              transform: scale(0.5);
            }
            .message {
              width: 95vw;
              margin-left: -47.5vw;
              font-size: 24px;
            }
            .candle {
              transform: scale(0.5);
            }
          }
        `}</style>

        {/* Birthday cake modal with background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25 }}
          className="birthday-cake-modal rounded-3xl overflow-hidden shadow-2xl relative"
          style={{
            width: "85vw",
            height: "85vh",
            maxWidth: "1100px",
            maxHeight: "850px",
            cursor: 'default'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 text-white hover:text-white text-2xl font-bold bg-black/30 backdrop-blur-md rounded-full w-14 h-14 flex items-center justify-center border-2 border-white/30 hover:border-white/50 hover:bg-black/50 transition-all shadow-xl z-50"
          >
            <FaTimes />
          </motion.button>

          <div className="cake-container">
            <div className="cake" onClick={putOutAllCandles}>
              <div className="icing">
                <div className="drip"></div>
                <div className="drip"></div>
                <div className="drip"></div>
                <div className="drip"></div>
                <div className="drip"></div>
              </div>
              <div className="layer top"></div>
              <div className="layer middle"></div>
              <div className="layer bottom"></div>
            </div>

            {candleStates.map((candle) => (
              <div
                key={candle.id}
                className="candle"
                style={{
                  marginLeft: `${candle.x}px`,
                  marginTop: `${candle.y}px`,
                }}
                onClick={(e) => putOutCandle(candle.id, e)}
              >
                {candle.lit && (
                  <>
                    <div className="flame"></div>
                    <div className="flame"></div>
                    <div className="flame"></div>
                    <div className="flame"></div>
                    <div className="flame"></div>
                  </>
                )}
              </div>
            ))}

            <div id="message_container" className="message">
              {messages.length > 0
                ? messages.map((msg, idx) => (
                    <React.Fragment key={idx}>
                      {msg}
                      {idx < messages.length - 1 && <br />}
                    </React.Fragment>
                  ))
                : `Happy Birthday ${name !== null ? name : "to you!"}`}
            </div>

            {/* Instruction text */}
            <div 
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                fontFamily: '"Leckerli One", cursive',
                fontSize: '16px',
                color: '#f0e4d0',
                opacity: 0.7,
                width: '80%',
                zIndex: 10
              }}
            >
              Click candles to blow them out • Click cake to blow all out
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BirthdayCake;
