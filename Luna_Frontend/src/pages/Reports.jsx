import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#8884d8", "#82ca9d"];

const ReportPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [studyProgress, setStudyProgress] = useState(null);
  const [postureData, setPostureData] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/api/tasks", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTasks(response.data);
        const completed = response.data.filter((task) => task.completed);
        const pending = response.data.filter((task) => !task.completed);
        setCompletedTasks(completed);
        setPendingTasks(pending);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    const fetchStudyProgress = async () => {
      try {
        const response = await axiosInstance.get("/api/progress_report", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setStudyProgress(response.data);
      } catch (err) {
        console.error("Error fetching study progress:", err);
      }
    };

    const fetchPostureData = async () => {
      try {
        const response = await axiosInstance.get("/api/posture", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPostureData(response.data);
      } catch (err) {
        console.error("Error fetching posture data:", err);
      }
    };

    if (user) {
      fetchTasks();
      fetchStudyProgress();
      fetchPostureData();
    }
  }, [user]);

  useEffect(() => {
    console.log("Study Progress:", studyProgress);
    console.log("Posture Data:", postureData);
  }, [studyProgress, postureData]);

  const studyData = [
    { name: "Week 1", value: studyProgress?.week1 ?? 2 },
    { name: "Week 2", value: studyProgress?.week2 ?? 3 },
    { name: "Week 3", value: studyProgress?.week3 ?? 5 },
  ];

  const postureGraphData = [
    { name: "Week 1", value: postureData?.week1 ?? 65 },
    { name: "Week 2", value: postureData?.week2 ?? 70 },
    { name: "Week 3", value: postureData?.week3 ?? 80 },
  ];

  const taskPieData = [
    { name: "Completed", value: completedTasks.length },
    { name: "Pending", value: pendingTasks.length },
  ];

  const markTaskAsCompleted = async (taskId) => {
    try {
      await axiosInstance.put(
        `/api/tasks/${taskId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const updatedTasks = tasks.map((task) =>
        task._id === taskId ? { ...task, completed: true } : task
      );
      setTasks(updatedTasks);
      setCompletedTasks(updatedTasks.filter((task) => task.completed));
      setPendingTasks(updatedTasks.filter((task) => !task.completed));
    } catch (err) {
      console.error("Error marking task as completed:", err);
    }
  };

  return (
    <div className="h-auto pb-10 flex flex-col items-center justify-center bg-primary text-white">
      <h1 className="text-4xl md:text-6xl font-bold mt-10 mb-8">Your Progress Report</h1>

      {/* Study Progress */}
      <div className="w-full max-w-lg px-4 mb-6">
        <div className="bg-light p-6 rounded-md shadow-lg text-primary">
          <h2 className="text-2xl font-semibold mb-4">Study Progress</h2>
          {studyProgress ? (
            <>
              <p>Total Study Time: {studyProgress.totalStudyTime}</p>
              <p>Average Focus Score: {studyProgress.averageFocusScore}</p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-6"
              >
                <h3 className="text-xl font-semibold mb-2">Study Progress Graph</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={studyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          ) : (
            <p>No study progress data available.</p>
          )}
        </div>
      </div>

      {/* Posture Data */}
      <div className="w-full max-w-lg px-4 mb-6">
        <div className="bg-light p-6 rounded-md shadow-lg text-primary">
          <h2 className="text-2xl font-semibold mb-4">Posture Data</h2>
          {postureData ? (
            <>
              <p>Average Posture Score: {postureData.averagePostureScore}</p>
              <p>Time Spent with Good Posture: {postureData.timeSpentGoodPosture}</p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-6"
              >
                <h3 className="text-xl font-semibold mb-2">Posture Graph</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={postureGraphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          ) : (
            <p>No posture data available.</p>
          )}
        </div>
      </div>

      {/* Task Summary */}
      <div className="w-full max-w-lg px-4 mb-6">
        <div className="bg-light p-6 rounded-md shadow-lg text-primary">
          <h2 className="text-2xl font-semibold mb-4">Tasks Summary</h2>
          <p>Total Tasks: {tasks.length}</p>
          <p>Completed Tasks: {completedTasks.length}</p>
          <p>Pending Tasks: {pendingTasks.length}</p>

          <ul className="mt-4">
            {pendingTasks.map((task) => (
              <li key={task._id} className="flex justify-between items-center py-1">
                <span>{task.title}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => markTaskAsCompleted(task._id)}
                    className="text-sm px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Complete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6"
          >
            <h3 className="text-xl font-semibold mb-2">Task Completion Chart</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={taskPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  dataKey="value"
                >
                  {taskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
