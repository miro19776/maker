import axios from "axios";
import React, { useEffect } from "react";

interface Robot {
  robotId: number;
  leader_name: string;
  robot_name: string;
  Max_Points: number;
  Time: number;
  TotalHomPoint: number;
}

interface LeaderboardProps {
  formatTime: (milliseconds: number) => string;
}

const fetchRobots = async () => {
  const response = await axios("localhost:3000/api/leaderboard");
  return await response.data;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ formatTime }) => {
  const [robotsRoundOne, setRobotsRoundOne] = React.useState<Robot[]>([]);
  const [robotsRoundTwo, setRobotsRoundTwo] = React.useState<Robot[]>([]);
  const [sortedRobots, setSortedRobots] = React.useState<Robot[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRobots();
      setRobotsRoundOne(data.roundOne);
      setRobotsRoundTwo(data.roundTwo);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const combinedRobots = robotsRoundOne.map((robot, index) => {
      const roundTwoRobot = robotsRoundTwo[index];
      return {
        ...robot,
        Max_Points: Math.max(robot.Max_Points, roundTwoRobot.Max_Points),
        Time: Math.min(robot.Time, roundTwoRobot.Time),
        TotalHomPoint: Math.max(
          robot.TotalHomPoint,
          roundTwoRobot.TotalHomPoint
        ),
        disqualified: robot.disqualified || roundTwoRobot.disqualified,
      };
    });

    const qualifiedRobots = combinedRobots.filter(
      (robot) => !robot.disqualified
    );
    const disqualifiedRobots = combinedRobots.filter(
      (robot) => robot.disqualified
    );

    const sortedQualifiedRobots = qualifiedRobots.sort((a, b) => {
      if (a.Max_Points > b.Max_Points) {
        return -1;
      } else if (a.Max_Points < b.Max_Points) {
        return 1;
      } else {
        if (a.Time < b.Time) {
          return -1;
        } else if (a.Time > b.Time) {
          return 1;
        } else {
          if (a.TotalHomPoint > b.TotalHomPoint) {
            return -1;
          } else if (a.TotalHomPoint < b.TotalHomPoint) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    });

    const sortedDisqualifiedRobots = disqualifiedRobots.sort((a, b) => {
      if (a.Max_Points > b.Max_Points) {
        return -1;
      } else if (a.Max_Points < b.Max_Points) {
        return 1;
      } else {
        if (a.Time < b.Time) {
          return -1;
        } else if (a.Time > b.Time) {
          return 1;
        } else {
          if (a.TotalHomPoint > b.TotalHomPoint) {
            return -1;
          } else if (a.TotalHomPoint < b.TotalHomPoint) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    });

    setSortedRobots([...sortedQualifiedRobots, ...sortedDisqualifiedRobots]);
  }, [robotsRoundOne, robotsRoundTwo]);

  return (
    <div>
      <h2>Leaderboard</h2>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Leader</th>
            <th>Name</th>
            <th>Score</th>
            <th>Time</th>
            <th>HomPoints</th>
          </tr>
        </thead>
        <tbody>
          {sortedRobots.map((robot) => (
            <tr key={robot.robotId}>
              <td>{sortedRobots.indexOf(robot) + 1}</td>
              <td>{robot.leader_name}</td>
              <td>{robot.robot_name}</td>
              <td>{robot.Max_Points}</td>
              <td>{formatTime(robot.Time)}</td>
              <td>{robot.TotalHomPoint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
