import React, { useState, useEffect, useRef } from "react";
import Map from "./components/Map";
import axios from "axios";
import Swal from "sweetalert2";
import "./App.css";
import Leaderboard from "./components/leaderboard";

interface Robot {
  robotId: number;
  leader_name: string;
  robot_name: string;
  Max_Points: number;
  Time: number;
  TotalHomPoint: number;
}

interface RobotsCache {
  [key: string]: Robot;
}

const fetchRobots = async (): Promise<RobotsCache> => {
  const response = await axios.get("http://localhost:3000/api/leaderboard", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("Response:", response);
  if (
    response.status !== 200 ||
    !response.headers["content-type"].includes("application/json")
  ) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.data;
};

const App: React.FC = (): JSX.Element => {
  const [robotId, setRobotId] = useState<string>("");
  const [leaderName, setLeaderName] = useState<string>("");
  const [robotName, setRobotName] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [TotalHomPoint, setTotalHomPoint] = useState<number>(0);
  const [startclicked, setStartclicked] = useState<boolean>(false);
  const [isReadyClicked, setIsReadyClicked] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [robotsCache, setRobotsCache] = useState<RobotsCache>({});
  const [resetMap, setResetMap] = useState<boolean>(false);
  const [stopwatch, setStopwatch] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedOrDisqualifiedRobotsRef = useRef<Set<string>>(new Set());
  const [rounds, setRounds] = useState<string>("roundOne");

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(robotsCache).length === 0) {
        try {
          const data = await fetchRobots();
          console.log("Fetched robots:", data);
          setRobotsCache(data);
        } catch (error) {
          console.error("Error fetching robots:", error);
        }
      }
    };

    fetchData();
  }, [robotsCache, robotId]);

  const chooseRobot = () => {
    const availableRobots = Object.keys(robotsCache).filter(
      (robotId) => !completedOrDisqualifiedRobotsRef.current.has(robotId)
    );
    if (availableRobots.length > 0) {
      const robotId = availableRobots[0];
      const robot = robotsCache[robotId];
      setRobotId(robotId);
      setLeaderName(robot.leader_name);
      setRobotName(robot.robot_name);
      setScore(robot.Max_Points);
      setStopwatch(robot.Time);
      setTotalHomPoint(robot.TotalHomPoint);
    }
  };

  const startReadyCountdown = () => {
    setIsReadyClicked(true);
    setCountdown(120000);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 100) {
          clearInterval(countdownIntervalRef.current!);
          disqualifyRobot();
          return 0;
        }
        return prevCountdown - 100;
      });
    }, 100);
  };

  const startChallenge = () => {
    setStartclicked(true);
    setIsReadyClicked(false);
    setIsStopwatchRunning(true);
    if (timer) {
      clearInterval(timer);
    }
  };

  const disqualifyRobot = () => {
    setIsStopwatchRunning(false);
    Swal.fire({
      title: `${robotName} :La3nat el suiveur 3alaykom!`,
      showDenyButton: true,
      confirmButtonText: "Next",
      denyButtonText: "Retry",
      background: "linear-gradient(#C77700, #FFDD00)",
      preConfirm: () => {
        handleNext();
      },
      didOpen: () => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Enter") {
            Swal.clickConfirm();
          } else if (event.key === "Escape") {
            Swal.clickDeny();
          }
        };

        window.addEventListener("keydown", handleKeyDown);

        Swal.getPopup()?.addEventListener("keydown", handleKeyDown);

        Swal.getPopup()?.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            Swal.clickConfirm();
          } else if (event.key === "Escape") {
            Swal.clickDeny();
          }
        });

        Swal.getPopup()?.addEventListener("keydown", handleKeyDown);
      },
      willClose: () => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Enter") {
            Swal.clickConfirm();
          }
        };
        window.removeEventListener("keydown", handleKeyDown);
      },
    });
  };

  const updateScore = (score: number) => {
    setScore(score);
  };

  const handleNext = () => {
    completedOrDisqualifiedRobotsRef.current.add(robotId);
    if (
      completedOrDisqualifiedRobotsRef.current.size ===
      Object.keys(robotsCache).length
    ) {
      setRounds("roundTwo");
      setRobotId("");
      setRobotName("");
      setScore(0);
      setTotalHomPoint(0);
      setStartclicked(false);
      setIsReadyClicked(false);
      setTimer(null);
      setCountdown(10);
      setResetMap(true);
      setStopwatch(0);
      setIsStopwatchRunning(false);
      completedOrDisqualifiedRobotsRef.current.clear();
    } else {
      chooseRobot();
    }
    setStartclicked(false);
    setIsReadyClicked(false);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const remainingMilliseconds = milliseconds % 1000;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}.${remainingMilliseconds.toString().padStart(3, "0")}`;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "r":
          startReadyCountdown();
          break;
        case "s":
          startChallenge();
          break;
        case "c":
          chooseRobot();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div>
      <div>
        {robotName && (
          <div>
            {isReadyClicked && <p>Countdown: {formatTime(countdown)}</p>}
          </div>
        )}
      </div>
      {rounds === "roundTwo" &&
      completedOrDisqualifiedRobotsRef.current.size ===
        Object.keys(robotsCache).length ? (
        <Leaderboard formatTime={formatTime} />
      ) : (
        <div  className="mapinapp">
          <Map
          robotId={robotId}
          leaderName={leaderName}
          robotName={robotName}
          score={score}
          update={updateScore}
          homePoints={TotalHomPoint}
          rounds={rounds}
          resetMap={resetMap}
          onResetComplete={() => setResetMap(false)}
          stopwatch={stopwatch}
          setStopwatch={setStopwatch}
          isStopwatchRunning={isStopwatchRunning}
          formatTime={formatTime}
          completedOrDisqualifiedRobotsRef={completedOrDisqualifiedRobotsRef}
          disqualified={disqualifyRobot}
        />
        </div>
        
      )}
    </div>
  );
};

export default App;
