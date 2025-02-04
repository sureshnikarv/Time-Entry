import React, { useState, useEffect } from "react";
import { Box, AppBar, Toolbar, Typography, IconButton, Modal, TextField, Button, MenuItem, Snackbar, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { gql, useQuery } from "@apollo/client";
import axios from "axios";
import client from "../app/lib/client";
import dayjs from "dayjs";

const GET_PROJECTS = gql`
  query {
    projects {
      Name
      documentId
    }
  }
`;

const GET_TASKS = gql`
  query {
    tasks {
      documentId
      Name
      projects {
        Name
        documentId
      }
      Description
      EstimatedHours
    }
  }
`;

const GET_TIME_ENTRIES = gql`
  query GetTimeEntries {
    timeEntries {
      Date
      Minutes
      project {
        Name
      }
      task {
        documentId
        Name
      }
    }
  }
`;

const parseTimeToMinutes = (time) => {
  if (!time) return 0;
  const parts = time.split(":");
  const hours = parts.length > 1 ? parseInt(parts[0]) || 0 : 0;
  const minutes = parseInt(parts[parts.length - 1]) || 0;
  return hours * 60 + minutes;
};

const formatMinutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

export default function TimeEntry() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTaskEditDetails, setSelectedTaskEditDetails] = useState(null);

  const handleOpen = (taskDetails) => {
    setSelectedTaskEditDetails(taskDetails);
    setEditOpen(true);
  };
  const handleClosed = () => {
    setSelectedTaskEditDetails(null);
    setEditOpen(false);
  };

  const handleProjectChanged = (event) => {
    const newProject = dataProjects.projects.find(
      (project) => project.Name === event.target.value
    );
    setSelectedTaskEditDetails({
      ...selectedTaskEditDetails,
      project: newProject,
    });
  };

  const handleTaskChanged = (event) => {
    const newTask = filteredTasks.find(
      (task) => task.Name === event.target.value
    );
    setSelectedTaskEditDetails({
      ...selectedTaskEditDetails,
      task: newTask,
    });
  };

  const handleMinutesChange = (event) => {
    setSelectedTaskEditDetails({
      ...selectedTaskEditDetails,
      Minutes: event.target.value,
    });
  };

  const handleSubmited = () => {
    console.log('Updated task details:', selectedTaskEditDetails);
    handleClosed();
  };

  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [timeEntry, setTimeEntry] = useState(15);
  const [taskMinutes, setTaskMinutes] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [timeentriesOpen, settimeentriesOpen] = useState(false);
  const [timeentriesMessage, settimeentriesMessage] = useState("");
  const [timeentriesSeverity, settimeentriesSeverity] = useState("success");
  const [tabValue, setTabValue] = useState(1); 
  const [timeEntries, setTimeEntries] = useState({});
  const [activeDay, setActiveDay] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay() + 1);
    return today;
  });
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [storedTimeEntries, setStoredTimeEntries] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tasksForSelectedDay, setTasksForSelectedDay] = useState([]);
  const [editedRows, setEditedRows] = useState({});

  const {
    loading: loadingProjects,
    error: errorProjects,
    data: dataProjects,
  } = useQuery(GET_PROJECTS, { client });

  const {
    loading: loadingTasks,
    error: errorTasks,
    data: dataTasks,
  } = useQuery(GET_TASKS, { client });

  const { loading, error, data } = useQuery(GET_TIME_ENTRIES, { client });

  useEffect(() => {
    if (data?.timeEntries) {
      setStoredTimeEntries(data.timeEntries);

      const startOfWeek = new Date(currentWeekStart);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const filteredTasks = data.timeEntries.filter(entry => {
        const entryDate = new Date(entry.Date);
        return entryDate >= startOfWeek && entryDate <= endOfWeek;
      });

      setTasksForSelectedDate(filteredTasks);
    }
  }, [currentWeekStart, data]);

  const handleDateClick = (day) => {
    setActiveDay(day);

    const clickedDate = new Date(currentWeekStart);
    clickedDate.setDate(currentWeekStart.getDate() + daysOfWeek.indexOf(day));
    const formattedDate = dayjs(clickedDate).format("YYYY-MM-DD");

    const filteredTasks = storedTimeEntries.filter((entry) => {
      const entryDate = dayjs(entry.Date).format("YYYY-MM-DD");
      return entryDate === formattedDate;
    });

    setTasksForSelectedDate(filteredTasks);
    setSelectedDay(formattedDate);
    setTabValue(0);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setActiveDay(day);

    const clickedDate = new Date(currentWeekStart);
    clickedDate.setDate(currentWeekStart.getDate() + daysOfWeek.indexOf(day));

    const formattedDate = dayjs(clickedDate).format("dddd, DD MMM ");

    setSelectedDay(formattedDate);

    const filteredTasks = storedTimeEntries.filter((entry) => {
      const entryDate = dayjs(entry.Date).format("YYYY-MM-DD");
      return entryDate === dayjs(clickedDate).format("YYYY-MM-DD");
    });

    setTasksForSelectedDate(filteredTasks);
  };

  const handleAddClick = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleClosetimeentries = () => settimeentriesOpen(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) {
      const startOfWeek = new Date(currentWeekStart);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const filteredTasks = storedTimeEntries.filter(entry => {
        const entryDate = new Date(entry.Date);
        return entryDate >= startOfWeek && entryDate <= endOfWeek;
      });

      setTasksForSelectedDate(filteredTasks);
    }
  };

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setSelectedTask("");
  };

  const handleTimeChange = async (taskId, day, value) => {
    const updatedMinutes = {
      ...taskMinutes,
      [taskId]: {
        ...(taskMinutes[taskId] || {}),
        [day]: value,
      },
    };
    setTaskMinutes(updatedMinutes);
  
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(currentWeekStart.getDate() + daysOfWeek.indexOf(day));
    const formattedDate = dayjs(dayDate).format("YYYY-MM-DD");
  
    const timeEntryData = {
      data: {
        Date: formattedDate,
        Minutes: parseInt(value, 10),
        Notes: "",
        project: {
          connect: [
            {
              id: 1,
              documentId: dataTasks.tasks.find(t => t.documentId === taskId).projects[0].documentId,
            },
          ],
        },
        task: {
          connect: [
            {
              id: 3,
              documentId: taskId,
            },
          ],
        },
      },
    };
  
    try {
      const existingEntry = storedTimeEntries.find(entry => 
        entry.task.documentId === taskId && entry.Date === formattedDate
      );
  
      if (existingEntry) {
        await axios.put(`http://localhost:1337/api/time-entries/${existingEntry.id}`, timeEntryData, {
          headers: {
            Authorization: "YOUR_AUTH_TOKEN_HERE",
          },
        });
      } else {
        // Create new entry
        await axios.post("http://localhost:1337/api/time-entries", timeEntryData, {
          headers: {
            Authorization: "YOUR_AUTH_TOKEN_HERE",
          },
        });
      }
  
      settimeentriesMessage("Time entry updated successfully!");
      settimeentriesSeverity("success");
      settimeentriesOpen(true);
    } catch (error) {
      console.error("Error updating time entry: ", error.response?.data);
      settimeentriesMessage(
        `Error updating time entry: ${JSON.stringify(
          error.response?.data,
          null,
          2
        )}`
      );
      settimeentriesSeverity("error");
      settimeentriesOpen(true);
    }
  };

  const calculateTotal = (taskId) => {
    let totalMinutes = 0;
    tasksForSelectedDate.forEach((entry) => {
      if (entry.task?.documentId === taskId) {
        totalMinutes += entry.Minutes || 0;
      }
    });
    const taskEntries = taskMinutes[taskId] || {};
    totalMinutes += Object.values(taskEntries).reduce((total, time) => {
      return total + parseTimeToMinutes(time);
    }, 0);

    return formatMinutesToTime(totalMinutes);
  };

  const calculateWeekTotal = () => {
    const startOfWeek = new Date(currentWeekStart);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const filteredEntries = storedTimeEntries.filter(entry => {
      const entryDate = new Date(entry.Date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    const totalMinutes = filteredEntries.reduce((total, entry) => total + entry.Minutes, 0);
    return formatMinutesToTime(totalMinutes);
  };
  const formatMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h:${minutes.toString().padStart(2, '0')}m`;
  };

  const handleSubmit = async () => {
    const selectedTaskObj = dataTasks?.tasks?.find(
      (task) =>
        task.Name === selectedTask &&
        task.projects.some((project) => project.Name === selectedProject)
    );

    if (!selectedTaskObj) {
      settimeentriesMessage("Please select a valid task.");
      settimeentriesSeverity("error");
      settimeentriesOpen(true);
      return;
    }

    const formattedDate = dayjs(selectedDate).format("MM-DD-YYYY");

    const timeEntry_post = {
      data: {
        Date: selectedDate || new Date().toISOString(),
        Minutes: parseInt(timeEntry),
        Notes: notes || null,
        project: {
          connect: [
            {
              id: 1,
              documentId: selectedProject.documentId,
            },
          ],
        },
        task: {
          connect: [
            {
              id: 3,
              documentId: selectedTaskObj.documentId,
            },
          ],
        },
      },
    };

    try {
      await axios.post("http://localhost:1337/api/time-entries", timeEntry_post, {
        headers: {
          Authorization: "YOUR_AUTH_TOKEN_HERE",
        },
      });

      settimeentriesMessage("Time entry submitted successfully!");
      settimeentriesSeverity("success");
      settimeentriesOpen(true);
      setOpen(false);
      setSelectedProject("");
      setSelectedTask("");
      setTimeEntry(15);
      setNotes("");
      setTimeEntries();
    } catch (error) {
      console.error("Error submitting time entry: ", error.response?.data);
      settimeentriesMessage(
        `Error submitting time entry: ${JSON.stringify(
          error.response?.data,
          null,
          2
        )}`
      );
      settimeentriesSeverity("error");
      settimeentriesOpen(true);
    }
  };

  const filteredTasks = dataTasks?.tasks?.filter((task) =>
    task.projects.some((project) => project.Name === selectedProject)
  );

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    });
  };

  const handleWeekNavigation = (direction) => {
    const newWeekStart = new Date(currentWeekStart);
    if (direction === "prev") {
      newWeekStart.setDate(newWeekStart.getDate() - 7);
    } else if (direction === "next") {
      newWeekStart.setDate(newWeekStart.getDate() + 7);
    }
    setCurrentWeekStart(newWeekStart);
  };

  if (loadingProjects || loadingTasks || loading) return <p>Loading...</p>;
  if (errorProjects || errorTasks || error)
    return (
      <p>
        Error loading data: {errorProjects?.message || errorTasks?.message || error?.message}
      </p>
    );

  const startOfWeek = new Date(currentWeekStart);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const weekRange = `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${startOfWeek.toLocaleDateString(
    "en-US",
    { month: "long" }
  )} ${startOfWeek.getFullYear()}`;

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "Muoto,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" }}>
      <AppBar position="static" color="" sx={{ backgroundColor: "#f36a37" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: "white", fontFamily: "Muoto,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" }}
          >
            <b>Time Tracker</b>
          </Typography>
          <Box
            sx={{
              display: "inline-block",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              marginRight: "1rem",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                "& .MuiTabs-flexContainer": {
                  display: "flex",
                  justifyContent: "space-between",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: "bold",
                  flex: 1,
                  padding: "8px 16px",
                  color: "black",
                },
                "& .Mui-selected": {
                  backgroundColor: "#ffe5d9",
                  color: "#000",
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab label="Day" />
              <Tab label="Week" />
            </Tabs>
          </Box>
        </Toolbar>
      </AppBar>

      <div style={{ display: "flex" }}>
        <IconButton
          color="inherit"
          aria-label="add"
          onClick={handleAddClick}
          sx={{
            backgroundColor: "green",
            color: "white",
            margin: "1rem",
            "&:hover": { backgroundColor: "darkgreen" },
          }}
        >
          <AddIcon sx={{ fontSize: "3rem" }} />
        </IconButton>
        <Typography variant="h6" sx={{ marginTop: "2rem" }}>
          <b>{selectedDay}</b>
        </Typography>
      </div>

      <Box>
        {tabValue === 0 && (
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "lightgray" }}>
                    {daysOfWeek.map((day) => (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{
                          fontSize: "1.1rem",
                          cursor: "pointer",
                          borderBottom:
                            activeDay === day ? "3px solid #ff6f61" : "none",
                        }}
                        onClick={() => handleDayClick(day)}
                      >
                        <b>{day}</b>
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <b>Week Total</b><br />
                      <b>{calculateWeekTotal()}</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Table>
            </TableContainer>
            {selectedDay && (
              <TableContainer component={Paper} sx={{ marginTop: "20px" }}>
                <Table>
                  <TableBody>
                    {tasksForSelectedDate.length > 0 ? (
                      tasksForSelectedDate.map((entry, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell>
                            <b>
                              {entry.task?.Name || "No Task Assigned"} - (
                              {entry.project?.Name || "No Project Assigned"})
                            </b>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <b>{entry.Minutes} Min</b>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              onClick={() => handleOpen(entry)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No tasks available for the selected day
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <Dialog open={editOpen} onClose={handleClosed}>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogContent>
                      <TextField
                        select
                        label="Select Project"
                        fullWidth
                        value={selectedTaskEditDetails?.project?.Name || ""}
                        onChange={handleProjectChanged}
                        sx={{ marginBottom: "20px", marginTop: "25px" }}
                      >
                        {dataProjects?.projects?.map((project) => (
                          <MenuItem
                            key={project.documentId}
                            value={project.Name}
                            sx={{
                              "&:hover": {
                                backgroundColor: "#000",
                                color: "#fff",
                              },
                            }}
                          >
                            {project.Name}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        label="Select Task"
                        fullWidth
                        value={selectedTaskEditDetails?.task?.Name || ""}
                        onChange={handleTaskChanged}
                        sx={{ marginBottom: "20px" }}
                      >
                        {dataTasks?.tasks?.map((task) => (
                          <MenuItem
                            key={task.documentId}
                            value={task.Name}
                            sx={{
                              "&:hover": {
                                backgroundColor: "#000",
                                color: "#fff",
                              },
                            }}
                          >
                            {task.Name}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="Minutes"
                        type="number"
                        value={selectedTaskEditDetails?.Minutes || ""}
                        onChange={handleMinutesChange}
                        InputProps={{
                          inputProps: {
                            min: 15,
                            step: 15,
                          },
                        }}
                        sx={{ flex: "0 0 12px" }}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClosed}>Cancel</Button>
                      <Button onClick={handleSubmited}>Save</Button>
                    </DialogActions>
                  </Dialog>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <div style={{ marginTop: "-50px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <IconButton
                onClick={() => handleWeekNavigation("prev")}
                sx={{ fontSize: "2rem" }}
              >
                <ArrowLeftIcon />
              </IconButton>
              <Typography
                variant="body1"
                sx={{ margin: "0 10px", fontSize: "2rem" }}
              >
                {weekRange}
              </Typography>
              <IconButton onClick={() => handleWeekNavigation("next")}>
                <ArrowRightIcon />
              </IconButton>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "lightgray" }}>
                    <TableCell><b>Task</b></TableCell>
                    {daysOfWeek.map((day, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          cursor: "pointer",
                          textAlign: "center",
                          borderBottom:
                            activeDay === day ? "3px solid #ff6f61" : "none",
                        }}
                        onClick={() => handleDateClick(day)}
                      >
                        <Box>
                          <Typography variant="body1"><b>{day}</b></Typography>
                          <Typography variant="body2">
                            <b>{getWeekDates()[index]}</b>
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell>
                      <b>Week Total</b><br />
                      <b>{calculateWeekTotal()}</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {tasksForSelectedDate.length > 0 ? (
    tasksForSelectedDate.map((entry, rowIndex) => (
      <TableRow key={rowIndex}>
        <TableCell>
          <b>
            {entry.task?.Name || "No Task Assigned"}---
            {entry.project?.Name || "No Project Assigned"}
          </b>
        </TableCell>
        {daysOfWeek.map((day, colIndex) => (
          <TableCell key={colIndex}>
            <TextField
              value={
                colIndex === 0
                  ? entry.Minutes || ""
                  : taskMinutes[entry.task?.documentId]?.[day] || ""
              }
              onChange={(e) => {
                if (colIndex !== 0 && entry.task?.documentId) {
                  handleTimeChange(entry.task.documentId, day, e.target.value);
                }
              }}
              size="small"
              sx={{ width: "82px", borderRadius: "60px" }}
              placeholder="Min"
              InputProps={{
                readOnly: colIndex === 0,
              }}
            />
          </TableCell>
        ))}
        <TableCell>
          <Typography variant="body1" sx={{ width: "80px", textAlign: "center" }}>
            <b>
              {entry.task?.documentId
                ? calculateTotal(entry.task.documentId)
                : "N/A"}
            </b>
          </Typography>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={daysOfWeek.length + 3} align="center">
        No time entries available
      </TableCell>
    </TableRow>
  )}
</TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="time-entry-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "400px",
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            textAlign: "start",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Consolas",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0",
              padding: "10px",
              borderBottom: "2px solid #ccc",
              width: "105%",
              marginTop: "-20px",
              marginLeft: "-20px",
              borderRadius: "5px",
            }}
            gutterBottom
          >
            New Time Entry
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                paddingLeft: "8px",
                border: "none",
                background: "none",
                fontSize: "16px",
                color: "#000",
                outline: "none",
                cursor: "pointer",
                fontFamily: "Muoto,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              }}
            />
          </Typography>

          <TextField
            select
            label="Select Project"
            fullWidth
            value={selectedProject}
            onChange={handleProjectChange}
            sx={{ marginBottom: "20px", marginTop: "25px" }}
          >
            {dataProjects?.projects?.map((project) => (
              <MenuItem
                key={project.documentId}
                value={project.Name}
                sx={{
                  "&:hover": {
                    backgroundColor: "#000",
                    color: "#fff",
                  },
                }}
              >
                {project.Name}
              </MenuItem>
            ))}
          </TextField>

          {selectedProject && (
            <Box sx={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <TextField
                select
                label="Select Task"
                fullWidth
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                sx={{ marginBottom: "20px" }}
              >
                {filteredTasks?.length > 0 ? (
                  filteredTasks.map((task) => (
                    <MenuItem
                      key={task.documentId}
                      value={task.Name}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#000",
                          color: "#fff",
                        },
                      }}
                    >
                      {task.Name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No tasks available for this project</MenuItem>
                )}
              </TextField>

              <TextField
                label="Minutes"
                type="number"
                value={timeEntry}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setTimeEntry(value && value % 15 === 0 ? value : Math.ceil(value / 15) * 15);
                }}
                InputProps={{
                  inputProps: {
                    min: 15,
                    step: 15,
                  },
                }}
                sx={{ flex: "0 0 120px" }}
              />
            </Box>
          )}

          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ marginBottom: "20px" }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={timeentriesOpen}
        autoHideDuration={6000}
        onClose={handleClosetimeentries}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClosetimeentries}
          severity={timeentriesSeverity}
          sx={{ width: "100%" }}
        >
          {timeentriesMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
