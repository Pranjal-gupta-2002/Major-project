import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyB2415QB7DV1Uyk4_7RHOmLh8GOynmuU_s");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/createtimetable", async (req, res) => {
  try {
    const { schedule, selectedTeachers, selectedSubjects } = req.body;

    // console.log("Received data:", { selectedTeachers, selectedSubjects });

    // Prepare data for Gemini AI
    const jsonData = {
      teachers: selectedTeachers.map(teacher => ({ name: teacher, subject: "Unknown" })),
      subjects: selectedSubjects.map(subject => ({ name: subject, hoursPerWeek: 4 }))
    };
    console.log(jsonData)

    // Convert JSON data to a string for inclusion in the prompt
    const jsonDataString = JSON.stringify(jsonData, null, 2);
    console.log(jsonDataString)

    // Create a prompt for Gemini AI
    const prompt = `
    Given the following information:
    ${jsonDataString}

    Create a weekly timetable in JSON format. The timetable should include:
    - Each day of the week (Monday to Friday)
    - The subjects scheduled for each day
    - Ensure that the number of hours per week for each subject is allocated correctly across the week
    - Each subject should be taught by one of the available teachers

    Provide the timetable in JSON format like this:
    {
      "Monday": [
        {"subject": "Mathematics", "teacher": "Mr. Smith", "hours": 1},
        {"subject": "English", "teacher": "Ms. Johnson", "hours": 1}
      ],
      "Tuesday": [
        {"subject": "History", "teacher": "Mrs. Brown", "hours": 1},
        {"subject": "Science", "teacher": "Mr. White", "hours": 1}
      ],
      ...
    }
    Ensure the output is valid JSON. Do not include any explanations or additional text.
    `;

    console.log("Sending prompt to Gemini AI:", prompt);

    // Generate content with Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedTimetable = response.text();

    console.log("Raw AI response:", generatedTimetable);

    // Attempt to parse the generated timetable
    let parsedTimetable;
    try {
      parsedTimetable = JSON.parse(generatedTimetable);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error("Invalid JSON response from AI");
    }

    console.log("Parsed timetable:", parsedTimetable);

    // Send the generated timetable back to the client
    res.status(200).json({ 
      message: "Timetable created successfully", 
      timetable: parsedTimetable 
    });

  } catch (error) {
    console.error("Error processing timetable:", error);
    res.status(500).json({ message: "Error creating timetable", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});j