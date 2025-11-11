import React from "react";
import { FaCakeCandles, FaGift } from "react-icons/fa6";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import BirthdayCake from "./BirthdayCake";

const getZodiacSign = (month, day) => {
  const zodiacSigns = [
    { name: "Capricorn", icon: "♑", end: [1, 19] },
    { name: "Aquarius", icon: "♒", end: [2, 18] },
    { name: "Pisces", icon: "♓", end: [3, 20] },
    { name: "Aries", icon: "♈", end: [4, 19] },
    { name: "Taurus", icon: "♉", end: [5, 20] },
    { name: "Gemini", icon: "♊", end: [6, 20] },
    { name: "Cancer", icon: "♋", end: [7, 22] },
    { name: "Leo", icon: "♌", end: [8, 22] },
    { name: "Virgo", icon: "♍", end: [9, 22] },
    { name: "Libra", icon: "♎", end: [10, 22] },
    { name: "Scorpio", icon: "♏", end: [11, 21] },
    { name: "Sagittarius", icon: "♐", end: [12, 21] },
    { name: "Capricorn", icon: "♑", end: [12, 31] },
  ];

  for (let i = 0; i < zodiacSigns.length; i++) {
    const [endMonth, endDay] = zodiacSigns[i].end;
    if (month < endMonth || (month === endMonth && day <= endDay)) {
      return zodiacSigns[i];
    }
  }
  return { name: "Capricorn", icon: "♑" };
};

const BirthdayCard = ({ person, countdown, isBirthday, onClick }) => {
  const [open, setOpen] = React.useState(false);
  const [showCake, setShowCake] = React.useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const zodiacSign = getZodiacSign(person.month, person.day);
  
  // Convert countdown to days with 8 decimal places
  const daysUntilBirthday = countdown.totalDays.toFixed(8);

  const handleCardClick = () => {
    if (isMobile) {
      setOpen((prev) => !prev);
    } else if (isBirthday) {
      setShowCake(true);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <>
      {showCake && isBirthday && (
        <BirthdayCake
          candles={Math.min(Math.floor(person.currentAge), 100)}
          name={person.name}
          onClose={() => setShowCake(false)}
        />
      )}
      
      <Tooltip
        open={isMobile ? open : undefined}
        onOpenChange={isMobile ? setOpen : undefined}
      >
        <TooltipTrigger asChild>
          <div
            className={`
              relative group cursor-pointer
              bg-white/5 backdrop-blur-md border-2
              rounded-2xl px-6 py-5
              transition-all duration-500 ease-out
              hover:scale-[1.02] hover:shadow-2xl
              ${
                isBirthday
                  ? "border-white/40 bg-white/10 animate-pulse shadow-2xl shadow-white/20"
                  : "border-white/10 hover:border-white/30 hover:shadow-white/10"
              }
              select-none
            `}
            onClick={handleCardClick}
          >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`
              flex-shrink-0 w-12 h-12 rounded-xl 
              flex items-center justify-center
              transition-all duration-300
              ${
                isBirthday
                  ? "bg-white/20 text-white animate-bounce"
                  : "bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white"
              }
            `}
            >
              {isBirthday ? (
                <FaCakeCandles className="text-2xl" />
              ) : (
                <FaGift className="text-2xl" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`font-bold text-white truncate ${
                    isBirthday ? "text-xl" : "text-lg"
                  }`}
                >
                  {person.name}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold shrink-0 border-white/20 text-white/60"
                >
                  {zodiacSign.icon} {zodiacSign.name}
                </Badge>
              </div>

              {/* Countdown Display */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-white/50">
                  {isBirthday ? "It's their birthday!" : "Days until birthday:"}
                </div>
                {!isBirthday && (
                  <div className="font-mono text-2xl font-bold text-white">
                    {daysUntilBirthday}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar for visual countdown */}
          {!isBirthday && (
            <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white/30 transition-all duration-300"
                style={{
                  width: `${Math.max(5, 100 - (countdown.totalDays / 365) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className={`${
          isMobile ? "text-sm max-w-[250px]" : "max-w-[300px]"
        } bg-[#1a1a1a] backdrop-blur-md border-white/20`}
      >
        <div className="space-y-2">
          {isBirthday ? (
            <div className="text-center">
              <p className="font-bold text-white text-lg mb-1">
                Happy Birthday!
              </p>
              <p className="text-sm text-white/60">
                They are {Math.floor(person.currentAge)} years old today!
              </p>
            </div>
          ) : (
            <>
              <p className="font-semibold text-white">Current Age:</p>
              <p className="font-mono text-2xl font-bold text-white">
                {person.currentAge.toFixed(12)}
              </p>
              <div className="pt-2 border-t border-white/20">
                <p className="text-xs text-white/60">
                  {countdown.totalHours.toFixed(2)} hours until next birthday
                </p>
              </div>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
    </>
  );
};

export default BirthdayCard;
