import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BirthdayCard from "./BirthdayCard";
import BirthdayCake from "./BirthdayCake";

const Countdown = () => {
  const [time, setTime] = useState(() => new Date());
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch birthdays from backend
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const endpoint = import.meta.env.VITE_API_BIRTHDAY_ENDPOINT || "/api/birthdays";
        const response = await fetch(`${baseUrl}${endpoint}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setPeople(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch birthdays:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  // Update time continuously
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 100);
    return () => clearInterval(interval);
  }, []);

  const calculateCountdown = (person, now) => {
    const nextBirthday = new Date(
      now.getFullYear(),
      person.month - 1,
      person.day,
      person.hour,
      person.minute,
      0,
      0
    );

    if (nextBirthday < now) {
      nextBirthday.setFullYear(now.getFullYear() + 1);
    }

    const diffMs = nextBirthday - now;
    const totalSeconds = diffMs / 1000;
    const totalMinutes = totalSeconds / 60;
    const totalHours = totalMinutes / 60;
    const totalDays = totalHours / 24;

    const days = Math.floor(totalDays);
    const hours = Math.floor(totalHours % 24);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.floor(totalSeconds % 60);

    return {
      days,
      hours,
      minutes,
      seconds,
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalDays: parseFloat(totalDays.toFixed(8)),
      totalSeconds,
    };
  };

  const isBirthdayToday = (person, now) => {
    return (
      now.getMonth() === person.month - 1 &&
      now.getDate() === person.day
    );
  };

  // Calculate countdown for each person and sort by who's birthday is next
  // Recalculate age in real-time based on current time
  const peopleWithCountdown = people.map((person) => {
    const countdown = calculateCountdown(person, time);
    const birthday = isBirthdayToday(person, time);
    
    // Recalculate current age in real-time with validation
    const birthDate = new Date(
      person.year,
      person.month - 1,
      person.day,
      person.hour || 0,
      person.minute || 0,
      0,
      0
    );
    
    // Validate the birth date
    const ageMs = time - birthDate;
    let ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
    
    // Ensure age is valid and reasonable
    if (!isFinite(ageYears) || ageYears < 0 || ageYears > 150) {
      console.warn(`Invalid age calculated for ${person.name}:`, ageYears);
      ageYears = 0;
    }

    return {
      ...person,
      currentAge: ageYears, // Override with real-time calculated age
      countdown,
      isBirthday: birthday,
    };
  }).sort((a, b) => a.countdown.totalSeconds - b.countdown.totalSeconds);

  const birthdayPerson = peopleWithCountdown.find((p) => p.isBirthday);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading birthdays...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-12 text-center text-white">
          Birthday Countdown
        </h1>

        {birthdayPerson && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12 p-8 bg-white/5 border-2 border-white/20 rounded-2xl text-center backdrop-blur-sm"
          >
            <p className="text-3xl font-bold text-white mb-4">
              Today is {birthdayPerson.name}'s Birthday!
            </p>
            <button
              onClick={() => setSelectedPerson(birthdayPerson)}
              className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
            >
              Celebrate
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peopleWithCountdown.map((person, index) => (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <BirthdayCard
                person={person}
                countdown={person.countdown}
                isBirthday={person.isBirthday}
                onClick={() => person.isBirthday && setSelectedPerson(person)}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-white/40">
          Current time: {time.toLocaleString()}
        </div>
      </motion.div>

      {selectedPerson && (
        <BirthdayCake
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
};

export default Countdown;
