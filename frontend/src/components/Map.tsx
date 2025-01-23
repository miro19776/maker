import React, { useEffect, useState, useRef } from "react";
import Defaultimg from "../assets/mapfirst.png";
import challenge1img from "../assets/challengesImgs/challenge1.png";
import challenge2img from "../assets/challengesImgs/challenge2.png";
import challenge3img from "../assets/challengesImgs/challenge3.png";
import challenge4img from "../assets/challengesImgs/challenge4.png";
import challenge5img from "../assets/challengesImgs/challenge5.png";
import fin from "../assets/last.png";
import lineFollower from "../assets/Istic_Robots_2.0_line_follower_icon.png";
import io from "socket.io-client";
import Swal from "sweetalert2";
import "../App.css";
import axios from "axios";
import logo from "../assets/Istic_Robots_2.0.png";
interface Robot {
  id: number;
  score: number;
  time: number;
  challenge1: number;
  challenge2: number;
  challenge3: number;
  challenge4: number;
  challenge5: number;
  fin: number;
  disqualified: number;
}

interface MapProps {
  robotId: string;
  leaderName: string;
  robotName: string;
  score: number;
  homePoints: number;
  rounds: string;
  update: (score: number) => void;
  resetMap: boolean;
  onResetComplete: () => void;
  stopwatch: number;
  setStopwatch: React.Dispatch<React.SetStateAction<number>>;
  isStopwatchRunning: boolean;
  formatTime: (milliseconds: number) => string;
  completedOrDisqualifiedRobotsRef: React.MutableRefObject<Set<string>>;
  disqualified: () => void;
}

const Map: React.FC<MapProps> = ({
  robotId,
  leaderName,
  robotName,
  score,
  homePoints,
  update,
  rounds,
  resetMap,
  onResetComplete,
  stopwatch,
  setStopwatch,
  isStopwatchRunning,
  formatTime,
  completedOrDisqualifiedRobotsRef,
  disqualified,
}) => {
  const challengesCompletedRef = useRef<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [img, setImg] = useState<string>(Defaultimg);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendRobotDetails = async (data: Robot) => {
    axios.post("http://localhost:3000/api/saveRobot", {
      id: data.id,
      leaderName: leaderName,
      robotName: robotName,
      score: data.score,
      time: data.time,
      homePoints: homePoints,
      disqualified: data.disqualified,
      rounds: rounds,
    });
  };

  useEffect(() => {
    if (resetMap) {
      challengesCompletedRef.current = [
        false,
        false,
        false,
        false,
        false,
        false,
      ];
      setImg(Defaultimg);
      onResetComplete();
    }
  }, [resetMap, onResetComplete]);
  const banner = (challangeName: string) => {
    Swal.fire({
      title: `${challangeName}challange completed`,
      timer: 450,
      backdrop: false,
      showConfirmButton: false,
      didOpen: () => {
        const timer = Swal.getPopup()?.querySelector("b");
        setInterval(() => {
          if (timer) {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }
        }, 100);
      },
      willClose: () => {
        clearInterval(0);
      },
    });
  };

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("robotDetails", (data: Robot) => {
      console.log("Received robot details:", data);
      if (data.disqualified === 1) {
        disqualified();
        completedOrDisqualifiedRobotsRef.current.add(robotId);
        sendRobotDetails(data);
      }
      if (data.challenge1 > 0 && !challengesCompletedRef.current[0]) {
        challengesCompletedRef.current[0] = true;
        banner("l'oeil de cléopatre");
        setImg(challenge1img);
        update(data.score);
      }
      if (data.challenge2 > 0 && !challengesCompletedRef.current[1]) {
        challengesCompletedRef.current[1] = true;
        banner("les mistère d'Anubis");
        setImg(challenge2img);
        update(data.score);
      }
      if (data.challenge3 > 0 && !challengesCompletedRef.current[2]) {
        challengesCompletedRef.current[2] = true;
        banner("le repo éternel de la momie");
        setImg(challenge3img);
        update(data.score);
      }
      if (data.challenge4 > 0 && !challengesCompletedRef.current[3]) {
        challengesCompletedRef.current[3] = true;
        banner(" les alies du soleil divin");
        setImg(challenge4img);
        update(data.score);
      }
      if (data.challenge5 > 0 && !challengesCompletedRef.current[4]) {
        challengesCompletedRef.current[4] = true;
        banner("le gardien sacré de scarabée");
        setImg(challenge5img);
        update(data.score);
      }
      if (data.fin > 0 && !challengesCompletedRef.current[5]) {
        challengesCompletedRef.current[5] = true;
        banner("le triomphe au sommet de la pyramide");
        setImg(fin);
        update(data.score);
        completedOrDisqualifiedRobotsRef.current.add(robotId);
        sendRobotDetails(data);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    const interval = setInterval(() => {
      if (robotId) {
        socket.emit("getRobotDetails", robotId);
      }
    }, 300);

    return () => {
      clearInterval(interval);
      socket.disconnect();
      console.log("Disconnected from Socket.IO server");
    };
  }, [robotId, score]);

  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatch((prevTime) => prevTime + 100);
      }, 100);
    } else if (!isStopwatchRunning && stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }
    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isStopwatchRunning, setStopwatch]);

  return (
    <div>
      <div className="txt">
      <img src={logo} className="istic" />
        <div className="robot">
        <img src={lineFollower} className="lineFollower"></img>
        <p className="PP">Robot_Name:   {robotName}</p>
        <p className="PP">Score: {score}</p>
        <p className="PP">Time: {formatTime(stopwatch)} </p>
        </div>
      </div>

      <div className="mapp">
      <img src={img} alt="Challenge" className="img"/>
      </div>
      
    </div>
  );
};

export default React.memo(Map);
