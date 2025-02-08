const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001; // Changed to 3001 to avoid port conflict

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to the backup file
const DATA_FILE_PATH = path.join(__dirname, 'data', 'forum-data.json');

// Load existing data from the file if it exists
let topics = [];
let comments = [];

try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf8'));
    topics = data.topics || [];
    comments = data.comments || [];
} catch (err) {
    console.log('No existing data found. Starting with empty data.');
}

// Function to save data to the file
function saveData() {
    const data = {
        topics: topics,
        comments: comments
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('Data saved to file.');
}

// Route to get all topics
app.get('/api/topics', (req, res) => {
    res.json(topics);
});

// Route to post a new topic
app.post('/api/topics', (req, res) => {
    const { title, description, board } = req.body;
    if (!title || !description || !board) {
        return res.status(400).json({ error: 'Title, description, and board are required' });
    }
    const newTopic = {
        id: topics.length + 1,
        title: title,
        description: description,
        board: board,
        timestamp: new Date().toISOString(),
        comments: []
    };
    topics.push(newTopic);
    saveData(); // Save data after adding a new topic
    res.status(201).json(newTopic);
});

// Route to delete a topic by ID
app.delete('/api/topics/:topicId', (req, res) => {
    const topicId = parseInt(req.params.topicId, 10);
    topics = topics.filter(topic => topic.id !== topicId);
    saveData(); // Save data after deleting a topic
    res.status(200).json({ message: 'Topic deleted successfully' });
});

// Route to get all comments for a specific topic
app.get('/api/topics/:topicId/comments', (req, res) => {
    const topicId = parseInt(req.params.topicId, 10);
    const topic = topics.find(t => t.id === topicId);
    if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(topic.comments);
});

// Route to post a new comment for a specific topic
app.post('/api/topics/:topicId/comments', (req, res) => {
    const topicId = parseInt(req.params.topicId, 10);
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
    }
    const topic = topics.find(t => t.id === topicId);
    if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
    }
    const newComment = {
        id: topic.comments.length + 1,
        text: text,
        timestamp: new Date().toISOString()
    };
    topic.comments.push(newComment);
    saveData(); // Save data after adding a new comment
    res.status(201).json(newComment);
});

// Route to get topics by board
app.get('/api/topics/board/:board', (req, res) => {
    const board = req.params.board;
    const filteredTopics = topics.filter(topic => topic.board === board);
    res.json(filteredTopics);
});

// Route to get popular threads (based on number of comments)
app.get('/api/popular-threads', (req, res) => {
    const popularThreads = topics.sort((a, b) => b.comments.length - a.comments.length).slice(0, 5);
    res.json(popularThreads);
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Обработка ошибок при запуске сервера
app.on('error', (err) => {
    console.error(`Server error: ${err.message}`);
});

// Shutdown hooks to save data before exiting
process.on('SIGINT', () => {
    saveData();
    console.log('Data saved before shutdown.');
    process.exit(0);
});

process.on('SIGTERM', () => {
    saveData();
    console.log('Data saved before shutdown.');
    process.exit(0);
});